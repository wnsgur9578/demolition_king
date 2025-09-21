package com.e106.demolition_king.user.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
public class WithdrawRequestVo {
    @NotBlank
    @Schema(description = "본인 확인용 비밀번호", example = "userPassword123!")
    private String password;
}