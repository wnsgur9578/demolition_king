package com.e106.demolition_king.skin.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class SelectSkinRequestVo {
    @Schema(description = "토큰에 가져와 넣을값이라 빈값으로 두기", example = "")
    private String userUuid;
    @Schema(description = "스킨내부코드", example = "")
    private Integer playerSkinItemSeq;
}
