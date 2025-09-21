package com.e106.demolition_king.user.vo.out;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SimpleMessageResponseVo {
    @Schema(description = "응답 메시지")
    private String message;

    public static SimpleMessageResponseVo of(String message) {
        return SimpleMessageResponseVo.builder()
                .message(message)
                .build();
    }
}