package com.e106.demolition_king.user.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
//@NoArgsConstructor
//@AllArgsConstructor
@Builder
public class EmailVerificationRequestVo {
    @Schema(description = "검증할 이메일", example = "user@example.com")
    private String email;
}