package com.e106.demolition_king.game.vo.in;

import com.e106.demolition_king.game.dto.ReportDto;
import com.e106.demolition_king.game.dto.ReportPerDateRequestDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@Builder
public class ReportPerDateUpdateRequestVo {
    @Schema(description = "토큰에 가져와 넣을값이라 빈값으로 두기", example = "")
    private String userUuid;
    private Integer kcal;
    private BigDecimal playTimeDate;

    public ReportPerDateRequestDto toDto(ReportPerDateUpdateRequestVo vo) {
        return ReportPerDateRequestDto.builder()
                .userUuid(vo.getUserUuid())
                .kcal(vo.getKcal())
                .playDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .playTimeDate(vo.getPlayTimeDate())
                .build();
    }
}