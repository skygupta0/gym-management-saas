package com.gymsaas.module.user.dto;

import com.gymsaas.module.user.entity.Role;
import com.gymsaas.module.user.entity.UserStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;
    private String phone;
    private Role role;
    private UserStatus status;
    private String avatarUrl;
}
