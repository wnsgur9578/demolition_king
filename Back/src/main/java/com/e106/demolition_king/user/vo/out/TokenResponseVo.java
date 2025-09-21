package com.e106.demolition_king.user.vo.out;

import lombok.Builder;
import lombok.Getter;

@Getter
//@NoArgsConstructor
//@AllArgsConstructor
@Builder
public class TokenResponseVo {
    private String accessToken;
    private String refreshToken;
}