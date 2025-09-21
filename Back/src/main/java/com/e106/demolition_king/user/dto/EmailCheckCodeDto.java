package com.e106.demolition_king.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmailCheckCodeDto {
    private final String email;
    private final String code;  // 생성된 6자리 코드
}
