package com.e106.demolition_king.user.vo.out;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PasswordResponseVo {
    private final boolean available;
    private final String message;
}
