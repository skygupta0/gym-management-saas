package com.gymsaas.module.tenant.dto;

import com.gymsaas.module.tenant.entity.BusinessType;
import com.gymsaas.module.tenant.entity.Tenant;
import com.gymsaas.module.tenant.entity.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {

    private UUID id;
    private String name;
    private String slug;
    private BusinessType businessType;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String logoUrl;
    private String currency;
    private String timezone;
    private TenantStatus status;
    private Instant createdAt;

    public static TenantResponse fromEntity(Tenant tenant) {
        if (tenant == null) return null;
        return TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .slug(tenant.getSlug())
                .businessType(tenant.getBusinessType())
                .email(tenant.getEmail())
                .phone(tenant.getPhone())
                .address(tenant.getAddress())
                .city(tenant.getCity())
                .state(tenant.getState())
                .pincode(tenant.getPincode())
                .country(tenant.getCountry())
                .logoUrl(tenant.getLogoUrl())
                .currency(tenant.getCurrency())
                .timezone(tenant.getTimezone())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .build();
    }
}
