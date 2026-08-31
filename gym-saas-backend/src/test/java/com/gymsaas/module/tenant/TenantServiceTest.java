package com.gymsaas.module.tenant;

import com.gymsaas.common.exception.DuplicateResourceException;
import com.gymsaas.module.auth.dto.AuthResponse;
import com.gymsaas.module.tenant.dto.TenantOnboardRequest;
import com.gymsaas.module.tenant.dto.TenantResponse;
import com.gymsaas.module.tenant.dto.TenantUpdateRequest;
import com.gymsaas.module.tenant.entity.BusinessType;
import com.gymsaas.module.tenant.entity.TenantStatus;
import com.gymsaas.module.tenant.service.TenantService;
import com.gymsaas.module.user.entity.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TenantServiceTest {

    @Autowired
    private TenantService tenantService;

    @Test
    @DisplayName("Gym onboarding successfully creates tenant, owner user, and returns valid JWT")
    void testOnboardGym() {
        TenantOnboardRequest request = TenantOnboardRequest.builder()
                .gymName("Iron Paradise Gym")
                .businessType(BusinessType.TRADITIONAL_GYM)
                .email("info@ironparadise.com")
                .phone("9988776655")
                .address("100 MG Road")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560001")
                .ownerFirstName("Vikram")
                .ownerLastName("Sharma")
                .ownerEmail("vikram@ironparadise.com")
                .ownerPassword("StrongPassword123!")
                .build();

        AuthResponse authResponse = tenantService.onboardGym(request, "127.0.0.1", "TestAgent");

        assertNotNull(authResponse);
        assertNotNull(authResponse.getAccessToken());
        assertNotNull(authResponse.getRefreshToken());
        assertEquals("Iron Paradise Gym", authResponse.getGymName());
        assertEquals("iron-paradise-gym", authResponse.getGymSlug());
        assertNotNull(authResponse.getUser());
        assertEquals("vikram@ironparadise.com", authResponse.getUser().getEmail());
        assertEquals(Role.GYM_OWNER, authResponse.getUser().getRole());
    }

    @Test
    @DisplayName("Duplicate owner email throws DuplicateResourceException")
    void testDuplicateOwnerEmailThrowsException() {
        String sharedEmail = "duplicate@testgym.com";

        TenantOnboardRequest request1 = TenantOnboardRequest.builder()
                .gymName("Gym One")
                .businessType(BusinessType.CROSSFIT)
                .email("one@gym.com")
                .phone("9876543211")
                .ownerFirstName("Owner")
                .ownerEmail(sharedEmail)
                .ownerPassword("Pass123456!")
                .build();

        tenantService.onboardGym(request1, "127.0.0.1", "TestAgent");

        TenantOnboardRequest request2 = TenantOnboardRequest.builder()
                .gymName("Gym Two")
                .businessType(BusinessType.YOGA_STUDIO)
                .email("two@gym.com")
                .phone("9876543212")
                .ownerFirstName("Owner2")
                .ownerEmail(sharedEmail)
                .ownerPassword("Pass123456!")
                .build();

        assertThrows(DuplicateResourceException.class, () -> tenantService.onboardGym(request2, "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Duplicate gym names automatically generate unique slugs")
    void testSlugCollisionHandling() {
        TenantOnboardRequest request1 = TenantOnboardRequest.builder()
                .gymName("Apex Fitness")
                .businessType(BusinessType.TRADITIONAL_GYM)
                .email("contact1@apex.com")
                .phone("9876543201")
                .ownerFirstName("Owner1")
                .ownerEmail("owner1@apex.com")
                .ownerPassword("Pass123456!")
                .build();

        AuthResponse res1 = tenantService.onboardGym(request1, "127.0.0.1", "TestAgent");
        assertEquals("apex-fitness", res1.getGymSlug());

        TenantOnboardRequest request2 = TenantOnboardRequest.builder()
                .gymName("Apex Fitness")
                .businessType(BusinessType.TRADITIONAL_GYM)
                .email("contact2@apex.com")
                .phone("9876543202")
                .ownerFirstName("Owner2")
                .ownerEmail("owner2@apex.com")
                .ownerPassword("Pass123456!")
                .build();

        AuthResponse res2 = tenantService.onboardGym(request2, "127.0.0.1", "TestAgent");
        assertEquals("apex-fitness-1", res2.getGymSlug());
    }

    @Test
    @DisplayName("Updating tenant settings persists properly")
    void testUpdateTenant() {
        TenantOnboardRequest request = TenantOnboardRequest.builder()
                .gymName("Legacy Fitness")
                .businessType(BusinessType.TRADITIONAL_GYM)
                .email("legacy@gym.com")
                .phone("9876543203")
                .ownerFirstName("Owner3")
                .ownerEmail("owner3@legacy.com")
                .ownerPassword("Pass123456!")
                .build();

        AuthResponse authResponse = tenantService.onboardGym(request, "127.0.0.1", "TestAgent");
        var tenantId = authResponse.getUser().getTenantId();

        TenantUpdateRequest updateRequest = TenantUpdateRequest.builder()
                .name("Legacy Fitness Club Updated")
                .businessType(BusinessType.CROSSFIT)
                .email("newemail@legacy.com")
                .phone("9876543299")
                .city("Mumbai")
                .state("Maharashtra")
                .currency("INR")
                .timezone("Asia/Kolkata")
                .build();

        TenantResponse updated = tenantService.updateTenant(tenantId, updateRequest);

        assertEquals("Legacy Fitness Club Updated", updated.getName());
        assertEquals(BusinessType.CROSSFIT, updated.getBusinessType());
        assertEquals("newemail@legacy.com", updated.getEmail());
        assertEquals("Mumbai", updated.getCity());
    }
}
