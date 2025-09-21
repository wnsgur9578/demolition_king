package com.e106.demolition_king.user.vo.out;

import com.e106.demolition_king.user.dto.ProfileDto;
import com.e106.demolition_king.user.entity.Profile;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.Collections;

@Getter
@Setter
@Builder
public class GetUserInfoResponseVo {
    private String userUuid;
    private String userEmail;
    private String password;
    private String userNickname;
    private String kakaoId;
    private String googleSub;
    private ProfileDto profile;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}