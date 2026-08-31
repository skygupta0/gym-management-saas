package com.gymsaas.module.member.dto;

import com.gymsaas.module.member.entity.MemberStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;
    private String email;
    private String mobile;
    private String gender;
    private LocalDate dateOfBirth;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bloodGroup;
    private String medicalConditions;
    private String address;
    private String photoUrl;
    private MemberStatus status;
    private String notes;
}
