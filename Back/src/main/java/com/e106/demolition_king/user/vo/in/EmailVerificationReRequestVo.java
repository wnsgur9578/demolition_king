package com.e106.demolition_king.user.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
//@NoArgsConstructor
//@AllArgsConstructor
@Builder
public class EmailVerificationReRequestVo {
    @Schema(description = "검증할 이메일", example = "user@example.com")
    private String email;
    @Schema(description = "인증 코드", example = "메일 수신 코드")
    private String code;
}