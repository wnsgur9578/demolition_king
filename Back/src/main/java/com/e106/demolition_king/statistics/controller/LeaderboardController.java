package com.e106.demolition_king.statistics.controller;

import com.e106.demolition_king.statistics.service.LeaderboardService;
import com.e106.demolition_king.statistics.vo.out.LeaderboardTop10Vo;
import com.e106.demolition_king.statistics.vo.out.LeaderboardRankVo;
import com.e106.demolition_king.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics/leaderboard")
@Tag(name = "Leaderboard", description = "리더보드 관련 API")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final JwtUtil jwtUtil;

    @GetMapping("/top")
    @Operation(summary = "Top 10 리더보드 조회", description = "single_top_building 기준 상위 10명 조회 (동점자는 동순위)")
    public List<LeaderboardTop10Vo> getTop10() {
        return leaderboardService.getTop10();
    }

    @GetMapping("/me")
    @Operation(summary = "내 랭킹 조회", description = "JWT access token으로 내 순위 반환")
    public LeaderboardRankVo getMyRank(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "").trim();

        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        String userUuid = jwtUtil.getUserUuid(token);
        return leaderboardService.getMyRank(userUuid);
    }
}
