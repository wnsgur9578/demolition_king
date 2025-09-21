package com.e106.demolition_king.constructure.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ConstructureByEventInVo {
    @Schema(description = "한국 건물 여부", example = "true")
    private boolean eventK;

    @Schema(description = "이벤트 ID (1..n)", example = "1")
    private int id;
}