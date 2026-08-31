package com.gymsaas.module.member.service;

import com.gymsaas.common.exception.DuplicateResourceException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.module.audit.service.AuditService;
import com.gymsaas.module.member.dto.MemberCreateRequest;
import com.gymsaas.module.member.dto.MemberResponse;
import com.gymsaas.module.member.dto.MemberUpdateRequest;
import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.entity.MemberStatus;
import com.gymsaas.module.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<MemberResponse> listMembers(UUID tenantId, MemberStatus status, Pageable pageable) {
        Page<Member> page = status != null
                ? memberRepository.findByTenantIdAndStatus(tenantId, status, pageable)
                : memberRepository.findByTenantId(tenantId, pageable);
        return page.map(MemberResponse::from);
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberById(UUID tenantId, UUID memberId) {
        Member member = memberRepository.findByIdAndTenantId(memberId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));
        return MemberResponse.from(member);
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberByCode(UUID tenantId, String memberCode) {
        Member member = memberRepository.findByTenantIdAndMemberCode(tenantId, memberCode)
                .orElseThrow(() -> new ResourceNotFoundException("Member with code: " + memberCode));
        return MemberResponse.from(member);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> searchMembers(UUID tenantId, String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return memberRepository.searchMembers(tenantId, query.trim()).stream()
                .map(MemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MemberResponse createMember(UUID tenantId, MemberCreateRequest request) {
        if (memberRepository.existsByTenantIdAndMobile(tenantId, request.getMobile())) {
            throw new DuplicateResourceException("Member with mobile number " + request.getMobile() + " already exists in this gym.");
        }

        String memberCode = generateMemberCode(tenantId);

        Member member = Member.builder()
                .memberCode(memberCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .joiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : LocalDate.now())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .bloodGroup(request.getBloodGroup())
                .medicalConditions(request.getMedicalConditions())
                .address(request.getAddress())
                .photoUrl(request.getPhotoUrl())
                .status(MemberStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        member.setTenantId(tenantId);
        Member saved = memberRepository.save(member);

        auditService.log(tenantId, null, "MEMBER_CREATED", "Member", saved.getId(), "Enrolled member " + saved.getFullName() + " (" + memberCode + ")");
        log.info("Created member {} with code {} for tenant {}", saved.getFullName(), memberCode, tenantId);

        return MemberResponse.from(saved);
    }

    @Transactional
    public MemberResponse updateMember(UUID tenantId, UUID memberId, MemberUpdateRequest request) {
        Member member = memberRepository.findByIdAndTenantId(memberId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));

        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setEmail(request.getEmail());
        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            member.setMobile(request.getMobile());
        }
        member.setGender(request.getGender());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setEmergencyContactName(request.getEmergencyContactName());
        member.setEmergencyContactPhone(request.getEmergencyContactPhone());
        member.setBloodGroup(request.getBloodGroup());
        member.setMedicalConditions(request.getMedicalConditions());
        member.setAddress(request.getAddress());
        member.setPhotoUrl(request.getPhotoUrl());
        if (request.getStatus() != null) {
            member.setStatus(request.getStatus());
        }
        member.setNotes(request.getNotes());

        Member updated = memberRepository.save(member);
        auditService.log(tenantId, null, "MEMBER_UPDATED", "Member", updated.getId(), "Updated member profile for " + updated.getFullName());
        return MemberResponse.from(updated);
    }

    @Transactional
    public void deleteMember(UUID tenantId, UUID memberId) {
        Member member = memberRepository.findByIdAndTenantId(memberId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));
        member.setStatus(MemberStatus.INACTIVE);
        memberRepository.save(member);
        auditService.log(tenantId, null, "MEMBER_DEACTIVATED", "Member", memberId, "Deactivated member " + member.getFullName());
    }

    private synchronized String generateMemberCode(UUID tenantId) {
        Integer maxNumber = memberRepository.findMaxMemberCodeNumber(tenantId);
        int nextNum = (maxNumber != null ? maxNumber : 1000) + 1;
        return "MEM-" + nextNum;
    }
}
