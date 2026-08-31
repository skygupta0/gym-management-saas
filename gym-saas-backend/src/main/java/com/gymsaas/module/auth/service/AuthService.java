package com.gymsaas.module.auth.service;

import com.gymsaas.common.exception.ErrorCode;
import com.gymsaas.common.exception.GymException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.module.audit.service.AuditService;
import com.gymsaas.module.auth.dto.AuthResponse;
import com.gymsaas.module.auth.dto.ForgotPasswordRequest;
import com.gymsaas.module.auth.dto.LoginRequest;
import com.gymsaas.module.auth.dto.RefreshTokenRequest;
import com.gymsaas.module.auth.dto.ResetPasswordRequest;
import com.gymsaas.module.auth.entity.RefreshToken;
import com.gymsaas.module.auth.repository.RefreshTokenRepository;
import com.gymsaas.module.tenant.entity.Tenant;
import com.gymsaas.module.tenant.entity.TenantStatus;
import com.gymsaas.module.tenant.repository.TenantRepository;
import com.gymsaas.module.user.dto.UserResponse;
import com.gymsaas.module.user.entity.User;
import com.gymsaas.module.user.entity.UserStatus;
import com.gymsaas.module.user.repository.UserRepository;
import com.gymsaas.security.jwt.JwtService;
import com.gymsaas.security.userdetails.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Value("${app.jwt.refresh-token-expiration-ms:2592000000}")
    private long refreshTokenExpirationMs;

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        log.info("Attempting login for user: {}", request.getEmail());

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new GymException(ErrorCode.INVALID_CREDENTIALS));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new GymException(ErrorCode.ACCOUNT_INACTIVE, "Your account is not active. Please contact administrator.");
        }

        Tenant tenant = null;
        if (user.getTenantId() != null) {
            tenant = tenantRepository.findById(user.getTenantId())
                    .orElseThrow(() -> new GymException(ErrorCode.TENANT_NOT_FOUND, "Gym tenant not found."));

            if (tenant.getStatus() == TenantStatus.SUSPENDED || tenant.getStatus() == TenantStatus.INACTIVE) {
                throw new GymException(ErrorCode.ACCOUNT_INACTIVE, "Gym subscription is suspended or inactive.");
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            log.warn("Invalid password attempt for email: {}", request.getEmail());
            throw new GymException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String gymName = tenant != null ? tenant.getName() : null;
        String gymSlug = tenant != null ? tenant.getSlug() : null;

        String accessToken = jwtService.generateAccessToken(userDetails, gymName);
        String refreshTokenStr = jwtService.generateRefreshToken(userDetails);

        // Store refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenStr)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        auditService.log(
                user.getTenantId(),
                user,
                "USER_LOGIN",
                "USER",
                user.getId().toString(),
                null,
                Map.of("loginTime", Instant.now().toString()),
                ipAddress,
                userAgent
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.fromEntity(user))
                .gymName(gymName)
                .gymSlug(gymSlug)
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenStr = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new GymException(ErrorCode.INVALID_TOKEN, "Refresh token not found"));

        if (!refreshToken.isValid()) {
            throw new GymException(ErrorCode.TOKEN_EXPIRED, "Refresh token is expired or revoked");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", refreshToken.getUserId()));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new GymException(ErrorCode.ACCOUNT_INACTIVE);
        }

        Tenant tenant = null;
        if (user.getTenantId() != null) {
            tenant = tenantRepository.findById(user.getTenantId()).orElse(null);
        }

        // Revoke old token (rotation)
        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);

        // Issue new tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String gymName = tenant != null ? tenant.getName() : null;
        String gymSlug = tenant != null ? tenant.getSlug() : null;

        String newAccessToken = jwtService.generateAccessToken(userDetails, gymName);
        String newRefreshTokenStr = jwtService.generateRefreshToken(userDetails);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(newRefreshTokenStr)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.fromEntity(user))
                .gymName(gymName)
                .gymSlug(gymSlug)
                .build();
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(token -> {
                token.setRevoked(true);
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
            userRepository.save(user);
            log.info("Generated password reset token for user {}: {}", user.getEmail(), token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new GymException(ErrorCode.INVALID_TOKEN, "Invalid or expired password reset token"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new GymException(ErrorCode.TOKEN_EXPIRED, "Password reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        // Revoke all existing sessions for security
        refreshTokenRepository.revokeAllUserTokens(user.getId(), Instant.now());
        log.info("Password successfully reset for user {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new GymException(ErrorCode.UNAUTHORIZED, "User is not authenticated");
        }

        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getUserId()));

        return UserResponse.fromEntity(user);
    }
}
