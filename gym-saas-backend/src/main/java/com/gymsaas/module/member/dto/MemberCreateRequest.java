package com.gymsaas.module.member.dto;

import com.gymsaas.module.member.entity.MemberStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberCreateRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9+ -]{7,15}$", message = "Invalid mobile phone format")
    private String mobile;

    private String gender;
    private LocalDate dateOfBirth;
    private LocalDate joiningDate;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bloodGroup;
    private String medicalConditions;
    private String address;
    private String photoUrl;
    private String notes;

    // Optional immediate plan enrollment
    private UUID planId;
}
