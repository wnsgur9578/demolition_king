package com.e106.demolition_king.statistics.vo.out;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "리더보드 Top 10 항목 VO")
public record LeaderboardTop10Vo(

        @Schema(description = "순위 (동점자 dense rank)", example = "1")
        int rank,

        @Schema(description = "유저 닉네임", example = "철수")
        String nickname,

        @Schema(description = "점수 (singleTopBuilding 기준)", example = "120")
        int score

) {}
