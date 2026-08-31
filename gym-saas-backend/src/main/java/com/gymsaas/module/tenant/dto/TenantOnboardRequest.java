package com.gymsaas.module.tenant.dto;

import com.gymsaas.module.tenant.entity.BusinessType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantOnboardRequest {

    @NotBlank(message = "Gym name is required")
    private String gymName;

    @NotNull(message = "Business type is required")
    private BusinessType businessType;

    @NotBlank(message = "Gym official email is required")
    @Email(message = "Please provide a valid gym email")
    private String email;

    @NotBlank(message = "Gym phone number is required")
    private String phone;

    private String address;
    private String city;
    private String state;
    private String pincode;

    @NotBlank(message = "Owner first name is required")
    private String ownerFirstName;

    private String ownerLastName;

    @NotBlank(message = "Owner email is required")
    @Email(message = "Please provide a valid owner email")
    private String ownerEmail;

    @NotBlank(message = "Owner password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String ownerPassword;

    private String ownerPhone;
}
