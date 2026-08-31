package com.gymsaas.module.user.entity;

public enum Role {
    SUPER_ADMIN,
    GYM_OWNER,
    GYM_ADMIN,
    STAFF,
    TRAINER,
    MEMBER;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
