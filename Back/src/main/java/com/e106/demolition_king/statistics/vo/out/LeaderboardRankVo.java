package com.e106.demolition_king.statistics.vo.out;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "내 리더보드 순위 VO")
public record LeaderboardRankVo(

        @Schema(description = "내 순위 (dense rank)", example = "4")
        int rank,

        @Schema(description = "내 닉네임", example = "나")
        String nickname,

        @Schema(description = "내 점수 (singleTopBuilding 기준)", example = "98")
        int score

) {}
