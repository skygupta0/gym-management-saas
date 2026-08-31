package com.gymsaas.module.tenant.dto;

import com.gymsaas.module.tenant.entity.BusinessType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantUpdateRequest {

    @NotBlank(message = "Gym name is required")
    private String name;

    @NotNull(message = "Business type is required")
    private BusinessType businessType;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String logoUrl;
    private String currency;
    private String timezone;
}
