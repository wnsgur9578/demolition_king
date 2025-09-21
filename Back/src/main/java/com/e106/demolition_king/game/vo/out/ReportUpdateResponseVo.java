package com.e106.demolition_king.game.vo.out;

import com.e106.demolition_king.game.dto.ReportDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReportUpdateResponseVo {
    private String userUuid;
    private Long reportSeq;
    private Integer singleTopBuilding;
    private Integer multiTopBuilding;
    private Integer goldMedal;
    private Integer silverMedal;
    private Integer bronzeMedal;
    private LocalDateTime createdAt;
    private Integer playCnt;

    public static ReportUpdateResponseVo fromDto(ReportDto dto) {
        return ReportUpdateResponseVo.builder()
                .userUuid(dto.getUserUuid())
                .playCnt(dto.getPlayCnt())
                .singleTopBuilding(dto.getSingleTopBuilding())
                .multiTopBuilding(dto.getMultiTopBuilding())
                .goldMedal(dto.getGoldMedal())
                .silverMedal(dto.getSilverMedal())
                .bronzeMedal(dto.getBronzeMedal())
                .build();
    }
}