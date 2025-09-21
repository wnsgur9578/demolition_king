package com.e106.demolition_king.constructure.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ConstructureSaveRequestVo {
    @Schema(description = "토큰에 가져와 넣을값이라 빈값으로 두기", example = "")
    private final String userUuid;
    private final List<Integer> constructureSeqList;
}
