package com.e106.demolition_king.user.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class NicknameCheckRequestVo {
    @Schema(description = "중복 검사할 닉네임", example = "ironman")
    private String nickname;
}
