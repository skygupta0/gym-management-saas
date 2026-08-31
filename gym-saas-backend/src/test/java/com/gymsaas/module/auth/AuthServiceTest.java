package com.gymsaas.module.auth;

import com.gymsaas.common.exception.GymException;
import com.gymsaas.module.auth.dto.AuthResponse;
import com.gymsaas.module.auth.dto.ForgotPasswordRequest;
import com.gymsaas.module.auth.dto.LoginRequest;
import com.gymsaas.module.auth.dto.RefreshTokenRequest;
import com.gymsaas.module.auth.dto.ResetPasswordRequest;
import com.gymsaas.module.auth.service.AuthService;
import com.gymsaas.module.tenant.dto.TenantOnboardRequest;
import com.gymsaas.module.tenant.entity.BusinessType;
import com.gymsaas.module.tenant.service.TenantService;
import com.gymsaas.module.user.entity.User;
import com.gymsaas.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private UserRepository userRepository;

    private String ownerEmail;
    private String ownerPassword;

    @BeforeEach
    void setUp() {
        ownerEmail = "owner-" + System.currentTimeMillis() + "@fitpulse.com";
        ownerPassword = "SecurePassword123!";

        TenantOnboardRequest request = TenantOnboardRequest.builder()
                .gymName("FitPulse Studio " + System.currentTimeMillis())
                .businessType(BusinessType.FITNESS_CENTER)
                .email("contact@fitpulse.com")
                .phone("9876543210")
                .ownerFirstName("Rajesh")
                .ownerLastName("Kumar")
                .ownerEmail(ownerEmail)
                .ownerPassword(ownerPassword)
                .build();

        tenantService.onboardGym(request, "127.0.0.1", "TestAgent");
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT access token and refresh token")
    void testSuccessfulLogin() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email(ownerEmail)
                .password(ownerPassword)
                .build();

        AuthResponse authResponse = authService.login(loginRequest, "127.0.0.1", "TestAgent");

        assertNotNull(authResponse);
        assertNotNull(authResponse.getAccessToken());
        assertNotNull(authResponse.getRefreshToken());
        assertEquals("Bearer", authResponse.getTokenType());
        assertNotNull(authResponse.getUser());
        assertEquals(ownerEmail.toLowerCase(), authResponse.getUser().getEmail());
    }

    @Test
    @DisplayName("Login with invalid password throws INVALID_CREDENTIALS")
    void testLoginWithInvalidPassword() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email(ownerEmail)
                .password("WrongPassword123")
                .build();

        assertThrows(GymException.class, () -> authService.login(loginRequest, "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Login with non-existent email throws INVALID_CREDENTIALS")
    void testLoginWithNonExistentEmail() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("nonexistent@gym.com")
                .password("SomePassword123")
                .build();

        assertThrows(GymException.class, () -> authService.login(loginRequest, "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Refresh token rotation successfully issues new tokens")
    void testRefreshTokenRotation() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email(ownerEmail)
                .password(ownerPassword)
                .build();

        AuthResponse initialAuth = authService.login(loginRequest, "127.0.0.1", "TestAgent");
        String firstRefreshToken = initialAuth.getRefreshToken();

        RefreshTokenRequest refreshRequest = RefreshTokenRequest.builder()
                .refreshToken(firstRefreshToken)
                .build();

        AuthResponse refreshedAuth = authService.refreshToken(refreshRequest);

        assertNotNull(refreshedAuth);
        assertNotNull(refreshedAuth.getAccessToken());
        assertNotNull(refreshedAuth.getRefreshToken());
        assertNotEquals(firstRefreshToken, refreshedAuth.getRefreshToken());

        // Attempting to reuse the revoked first refresh token MUST fail
        assertThrows(GymException.class, () -> authService.refreshToken(refreshRequest));
    }

    @Test
    @DisplayName("Forgot password and reset password flow works correctly")
    void testPasswordResetFlow() {
        ForgotPasswordRequest forgotRequest = ForgotPasswordRequest.builder()
                .email(ownerEmail)
                .build();

        authService.forgotPassword(forgotRequest);

        User user = userRepository.findByEmailIgnoreCase(ownerEmail).orElseThrow();
        assertNotNull(user.getPasswordResetToken());
        String token = user.getPasswordResetToken();

        String newPassword = "BrandNewPassword999!";
        ResetPasswordRequest resetRequest = ResetPasswordRequest.builder()
                .token(token)
                .newPassword(newPassword)
                .build();

        authService.resetPassword(resetRequest);

        // Verify login with new password succeeds
        LoginRequest newLoginRequest = LoginRequest.builder()
                .email(ownerEmail)
                .password(newPassword)
                .build();

        AuthResponse authResponse = authService.login(newLoginRequest, "127.0.0.1", "TestAgent");
        assertNotNull(authResponse.getAccessToken());
    }
}
