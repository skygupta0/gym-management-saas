package com.gymsaas.module.user.repository;

import com.gymsaas.module.user.entity.Role;
import com.gymsaas.module.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);

    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);

    List<User> findAllByTenantId(UUID tenantId);

    Page<User> findAllByTenantId(UUID tenantId, Pageable pageable);

    boolean existsByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);

    boolean existsByEmailIgnoreCaseAndTenantIdIsNull(String email);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndRole(UUID tenantId, Role role);
}
