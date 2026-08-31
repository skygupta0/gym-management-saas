package com.gymsaas.module.member.dto;

import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.entity.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {

    private UUID id;
    private UUID tenantId;
    private String memberCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
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
    private MemberStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public static MemberResponse from(Member member) {
        if (member == null) return null;
        return MemberResponse.builder()
                .id(member.getId())
                .tenantId(member.getTenantId())
                .memberCode(member.getMemberCode())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .fullName(member.getFullName())
                .email(member.getEmail())
                .mobile(member.getMobile())
                .gender(member.getGender())
                .dateOfBirth(member.getDateOfBirth())
                .joiningDate(member.getJoiningDate())
                .emergencyContactName(member.getEmergencyContactName())
                .emergencyContactPhone(member.getEmergencyContactPhone())
                .bloodGroup(member.getBloodGroup())
                .medicalConditions(member.getMedicalConditions())
                .address(member.getAddress())
                .photoUrl(member.getPhotoUrl())
                .status(member.getStatus())
                .notes(member.getNotes())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
