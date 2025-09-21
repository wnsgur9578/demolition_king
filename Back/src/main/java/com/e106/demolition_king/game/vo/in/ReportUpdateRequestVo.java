package com.e106.demolition_king.game.vo.in;

import com.e106.demolition_king.game.dto.ReportDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReportUpdateRequestVo {
    @Schema(description = "토큰에 가져와 넣을값이라 빈값으로 두기", example = "")
    private String userUuid;
    private Integer reportSeq;
    private Integer singleTopBuilding;
    private Integer multiTopBuilding;
    private Integer goldMedal;
    private Integer silverMedal;
    private Integer bronzeMedal;
    private Integer playCnt;
    private BigDecimal playTime;

    public ReportDto toDto(ReportUpdateRequestVo vo) {
        return ReportDto.builder()
                .reportSeq(vo.getReportSeq())
                .userUuid(vo.getUserUuid())
                .singleTopBuilding(vo.getSingleTopBuilding())
                .multiTopBuilding(vo.getMultiTopBuilding())
                .goldMedal(vo.getGoldMedal())
                .silverMedal(vo.getSilverMedal())
                .bronzeMedal(vo.getBronzeMedal())
                .playCnt(vo.getPlayCnt())
                .playTime(vo.getPlayTime())
                .build();
    }
}