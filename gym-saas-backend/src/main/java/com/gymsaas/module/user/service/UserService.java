package com.gymsaas.module.user.service;

import com.gymsaas.common.exception.DuplicateResourceException;
import com.gymsaas.common.exception.GymException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.module.user.dto.UserCreateRequest;
import com.gymsaas.module.user.dto.UserResponse;
import com.gymsaas.module.user.dto.UserUpdateRequest;
import com.gymsaas.module.user.entity.Role;
import com.gymsaas.module.user.entity.User;
import com.gymsaas.module.user.entity.UserStatus;
import com.gymsaas.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(UUID tenantId, Pageable pageable) {
        return userRepository.findAllByTenantId(tenantId, pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID tenantId, UUID userId) {
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(UUID tenantId, UserCreateRequest request) {
        if (request.getRole() == Role.SUPER_ADMIN) {
            throw new GymException(com.gymsaas.common.exception.ErrorCode.ACCESS_DENIED, "Cannot create SUPER_ADMIN user via tenant portal");
        }

        if (userRepository.findByEmailIgnoreCase(request.getEmail().trim()).isPresent()) {
            throw new DuplicateResourceException("User with email " + request.getEmail() + " already exists");
        }

        User user = User.builder()
                .tenantId(tenantId)
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName() != null ? request.getLastName().trim() : null)
                .phone(request.getPhone())
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("Created user [{}] with role [{}] in tenant [{}]", user.getEmail(), user.getRole(), tenantId);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUser(UUID tenantId, UUID userId, UserUpdateRequest request) {
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : null);
        user.setPhone(request.getPhone());
        if (request.getRole() != null && request.getRole() != Role.SUPER_ADMIN) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void deleteUser(UUID tenantId, UUID userId) {
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.GYM_OWNER) {
            throw new GymException(com.gymsaas.common.exception.ErrorCode.BAD_REQUEST, "Cannot delete primary gym owner account");
        }

        userRepository.delete(user);
        log.info("Deleted user [{}] from tenant [{}]", userId, tenantId);
    }
}
