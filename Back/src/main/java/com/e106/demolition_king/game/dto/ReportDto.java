package com.e106.demolition_king.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportDto {
    private Integer reportSeq;
    private String userUuid;
    private Integer singleTopBuilding;
    private Integer multiTopBuilding;
    private Integer goldMedal;
    private Integer silverMedal;
    private Integer bronzeMedal;
    private LocalDateTime createdAt;
    private Integer playCnt;
    private BigDecimal playTime;
}