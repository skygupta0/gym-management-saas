package com.gymsaas.module.tenant.service;

import com.gymsaas.common.exception.DuplicateResourceException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.common.util.SlugUtil;
import com.gymsaas.module.audit.service.AuditService;
import com.gymsaas.module.auth.dto.AuthResponse;
import com.gymsaas.module.auth.entity.RefreshToken;
import com.gymsaas.module.auth.repository.RefreshTokenRepository;
import com.gymsaas.module.tenant.dto.TenantOnboardRequest;
import com.gymsaas.module.tenant.dto.TenantResponse;
import com.gymsaas.module.tenant.dto.TenantUpdateRequest;
import com.gymsaas.module.tenant.entity.Tenant;
import com.gymsaas.module.tenant.entity.TenantStatus;
import com.gymsaas.module.tenant.repository.TenantRepository;
import com.gymsaas.module.user.dto.UserResponse;
import com.gymsaas.module.user.entity.Role;
import com.gymsaas.module.user.entity.User;
import com.gymsaas.module.user.entity.UserStatus;
import com.gymsaas.module.user.repository.UserRepository;
import com.gymsaas.security.jwt.JwtService;
import com.gymsaas.security.userdetails.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
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
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Value("${app.jwt.refresh-token-expiration-ms:2592000000}")
    private long refreshTokenExpirationMs;

    @Transactional
    public AuthResponse onboardGym(TenantOnboardRequest request, String ipAddress, String userAgent) {
        log.info("Onboarding new gym: {}", request.getGymName());

        // Generate unique slug
        String baseSlug = SlugUtil.toSlug(request.getGymName());
        if (baseSlug.isBlank()) {
            baseSlug = "gym";
        }
        String slug = baseSlug;
        int counter = 1;
        while (tenantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        // Check if owner email is already taken
        if (userRepository.findByEmailIgnoreCase(request.getOwnerEmail()).isPresent()) {
            throw new DuplicateResourceException("Owner email is already registered in the system.");
        }

        // 1. Create Tenant
        Tenant tenant = Tenant.builder()
                .name(request.getGymName().trim())
                .slug(slug)
                .businessType(request.getBusinessType())
                .email(request.getEmail().trim())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .country("India")
                .currency("INR")
                .timezone("Asia/Kolkata")
                .status(TenantStatus.ACTIVE)
                .build();

        tenant = tenantRepository.saveAndFlush(tenant);

        // 2. Create GYM_OWNER User
        User owner = User.builder()
                .tenantId(tenant.getId())
                .email(request.getOwnerEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getOwnerPassword()))
                .firstName(request.getOwnerFirstName().trim())
                .lastName(request.getOwnerLastName() != null ? request.getOwnerLastName().trim() : null)
                .phone(request.getOwnerPhone() != null ? request.getOwnerPhone().trim() : request.getPhone())
                .role(Role.GYM_OWNER)
                .status(UserStatus.ACTIVE)
                .lastLoginAt(Instant.now())
                .build();

        owner = userRepository.saveAndFlush(owner);

        // 3. Issue authentication tokens immediately
        CustomUserDetails userDetails = new CustomUserDetails(owner);
        String accessToken = jwtService.generateAccessToken(userDetails, tenant.getName());
        String refreshTokenStr = jwtService.generateRefreshToken(userDetails);

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(owner.getId())
                .token(refreshTokenStr)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        // 4. Audit log
        auditService.log(
                tenant.getId(),
                owner,
                "GYM_ONBOARDED",
                "TENANT",
                tenant.getId().toString(),
                null,
                Map.of("gymName", tenant.getName(), "slug", tenant.getSlug(), "ownerEmail", owner.getEmail()),
                ipAddress,
                userAgent
        );

        log.info("Successfully onboarded gym [{}] with ID: {} and owner: {}", tenant.getName(), tenant.getId(), owner.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.fromEntity(owner))
                .gymName(tenant.getName())
                .gymSlug(tenant.getSlug())
                .build();
    }

    @Transactional(readOnly = true)
    public TenantResponse getTenantById(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", tenantId));
        return TenantResponse.fromEntity(tenant);
    }

    @Transactional
    public TenantResponse updateTenant(UUID tenantId, TenantUpdateRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", tenantId));

        tenant.setName(request.getName());
        tenant.setBusinessType(request.getBusinessType());
        tenant.setEmail(request.getEmail());
        tenant.setPhone(request.getPhone());
        tenant.setAddress(request.getAddress());
        tenant.setCity(request.getCity());
        tenant.setState(request.getState());
        tenant.setPincode(request.getPincode());
        if (request.getLogoUrl() != null) {
            tenant.setLogoUrl(request.getLogoUrl());
        }
        if (request.getCurrency() != null) {
            tenant.setCurrency(request.getCurrency());
        }
        if (request.getTimezone() != null) {
            tenant.setTimezone(request.getTimezone());
        }

        tenant = tenantRepository.save(tenant);
        return TenantResponse.fromEntity(tenant);
    }
}
