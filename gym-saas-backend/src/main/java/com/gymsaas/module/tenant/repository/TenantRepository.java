package com.gymsaas.module.tenant.repository;

import com.gymsaas.module.tenant.entity.Tenant;
import com.gymsaas.module.tenant.entity.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByEmailIgnoreCase(String email);

    Page<Tenant> findAllByStatus(TenantStatus status, Pageable pageable);
}
