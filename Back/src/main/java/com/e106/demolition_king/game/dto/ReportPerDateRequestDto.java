package com.e106.demolition_king.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportPerDateRequestDto {
    private String userUuid;
    private String playDate;
    private int kcal;
    private BigDecimal playTimeDate;
}