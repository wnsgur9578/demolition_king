package com.e106.demolition_king.user.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
//@NoArgsConstructor
//@AllArgsConstructor
@Builder
public class LoginRequestVo {
    @Schema(description = "이메일", example = "user@example.com")
    private String email;
    @Schema(description = "비밀번호", example = "1111")
    private String password;
}