package com.gymsaas.security;

import com.gymsaas.common.exception.GymException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.common.exception.TenantAccessDeniedException;
import com.gymsaas.module.user.dto.UserCreateRequest;
import com.gymsaas.module.user.dto.UserResponse;
import com.gymsaas.module.user.dto.UserUpdateRequest;
import com.gymsaas.module.user.entity.Role;
import com.gymsaas.module.user.repository.UserRepository;
import com.gymsaas.module.user.service.UserService;
import com.gymsaas.security.context.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CrossTenantSecurityTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private UUID tenantAId;
    private UUID tenantBId;

    @BeforeEach
    void setUp() {
        tenantAId = UUID.randomUUID();
        tenantBId = UUID.randomUUID();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("TenantContext should throw TenantAccessDeniedException when no tenant is set")
    void testTenantContextRequiresTenant() {
        assertFalse(TenantContext.hasTenant());
        assertThrows(TenantAccessDeniedException.class, TenantContext::getCurrentTenantId);
    }

    @Test
    @DisplayName("TenantContext should accurately set, retrieve, and clear tenant ID")
    void testTenantContextLifecycle() {
        TenantContext.setTenantId(tenantAId);
        assertTrue(TenantContext.hasTenant());
        assertEquals(tenantAId, TenantContext.getCurrentTenantId());

        TenantContext.clear();
        assertFalse(TenantContext.hasTenant());
    }

    @Test
    @DisplayName("Tenant B cannot read or access user belonging to Tenant A")
    void testCrossTenantReadIsolation() {
        // Create user in Tenant A
        UserCreateRequest createRequest = UserCreateRequest.builder()
                .email("trainer.a@gymalpha.com")
                .password("Password123!")
                .firstName("Trainer")
                .lastName("Alpha")
                .role(Role.TRAINER)
                .build();

        UserResponse userA = userService.createUser(tenantAId, createRequest);
        assertNotNull(userA.getId());
        assertEquals(tenantAId, userA.getTenantId());

        // Tenant A can access userA
        UserResponse foundByTenantA = userService.getUserById(tenantAId, userA.getId());
        assertNotNull(foundByTenantA);
        assertEquals(userA.getId(), foundByTenantA.getId());

        // Tenant B attempting to access userA MUST fail with ResourceNotFoundException (Defense-in-depth: hidden existence)
        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(tenantBId, userA.getId()));
    }

    @Test
    @DisplayName("Tenant B cannot update or mutate user belonging to Tenant A")
    void testCrossTenantUpdateIsolation() {
        UserCreateRequest createRequest = UserCreateRequest.builder()
                .email("staff.a@gymalpha.com")
                .password("Password123!")
                .firstName("Staff")
                .lastName("Alpha")
                .role(Role.STAFF)
                .build();

        UserResponse userA = userService.createUser(tenantAId, createRequest);

        UserUpdateRequest updateRequest = UserUpdateRequest.builder()
                .firstName("HackedName")
                .role(Role.GYM_ADMIN)
                .build();

        // Tenant B attempting to modify Tenant A's user MUST throw ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> userService.updateUser(tenantBId, userA.getId(), updateRequest));

        // Verify data was NOT mutated
        UserResponse verify = userService.getUserById(tenantAId, userA.getId());
        assertEquals("Staff", verify.getFirstName());
        assertEquals(Role.STAFF, verify.getRole());
    }

    @Test
    @DisplayName("Tenant B cannot delete user belonging to Tenant A")
    void testCrossTenantDeleteIsolation() {
        UserCreateRequest createRequest = UserCreateRequest.builder()
                .email("staff2.a@gymalpha.com")
                .password("Password123!")
                .firstName("Staff2")
                .lastName("Alpha")
                .role(Role.STAFF)
                .build();

        UserResponse userA = userService.createUser(tenantAId, createRequest);

        // Tenant B attempting to delete Tenant A's user MUST fail
        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(tenantBId, userA.getId()));

        // Verify user still exists in Tenant A
        UserResponse verify = userService.getUserById(tenantAId, userA.getId());
        assertNotNull(verify);
    }
}
