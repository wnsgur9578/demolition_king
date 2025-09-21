package com.e106.demolition_king.user.vo.out;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmailVerificationResponseVo {
    @Schema(description = "이메일 사용 가능 여부", example = "true")
    private boolean available;

    @Schema(description = "결과 메시지", example = "인증 코드 발송 완료")
    private String message;
}