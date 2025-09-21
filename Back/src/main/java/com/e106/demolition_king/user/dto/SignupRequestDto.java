package com.e106.demolition_king.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestDto {
    private String email;
    private String password;
    private String userNickname;
    private Integer profileSeq;
}
