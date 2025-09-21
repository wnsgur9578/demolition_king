package com.e106.demolition_king.game.vo.in;

import com.e106.demolition_king.game.dto.GoldDto;
import com.e106.demolition_king.game.dto.ReportDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class GoldUpdateRequestVo {
    @Schema(description = "토큰에 가져와 넣을값이라 빈값으로 두기", example = "")
    private String userUuid;
    private Integer goldCnt;

    public GoldDto toDto(GoldUpdateRequestVo vo) {
        return GoldDto.builder()
                .userUuid(vo.getUserUuid())
                .goldCnt(vo.getGoldCnt())
                .build();
    }
}