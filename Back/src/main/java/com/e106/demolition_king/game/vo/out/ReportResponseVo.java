package com.e106.demolition_king.game.vo.out;

import com.e106.demolition_king.game.dto.ReportDto;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ReportResponseVo {

    private Integer reportSeq;
    private BigDecimal playTime;
    private Integer playCnt;
    private Integer singleTopBuilding;
    private Integer multiTopBuilding;
    private Integer goldMedal;
    private Integer silverMedal;
    private Integer bronzeMedal;


    public static ReportResponseVo fromDto(ReportDto dto) {
        return ReportResponseVo.builder()
                .reportSeq(dto.getReportSeq())
                .playTime(dto.getPlayTime())
                .playCnt(dto.getPlayCnt())
                .singleTopBuilding(dto.getSingleTopBuilding())
                .multiTopBuilding(dto.getMultiTopBuilding())
                .goldMedal(dto.getGoldMedal())
                .silverMedal(dto.getSilverMedal())
                .bronzeMedal(dto.getBronzeMedal())
                .build();
    }
}