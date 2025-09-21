package com.e106.demolition_king.game.controller;


import com.e106.demolition_king.common.base.BaseResponse;
import com.e106.demolition_king.common.base.BaseResponseStatus;
import com.e106.demolition_king.friend.service.FriendService;
import com.e106.demolition_king.friend.vo.out.FriendResponseVo;
import com.e106.demolition_king.game.service.GameService;
import com.e106.demolition_king.game.service.GameServiceImpl;
import com.e106.demolition_king.game.vo.in.GoldUpdateRequestVo;
import com.e106.demolition_king.game.vo.in.ReportPerDateUpdateRequestVo;
import com.e106.demolition_king.game.vo.in.ReportUpdateRequestVo;
import com.e106.demolition_king.game.vo.out.*;
import com.e106.demolition_king.user.service.UserServiceImpl;
import com.e106.demolition_king.user.vo.in.EmailVerificationReRequestVo;
import com.e106.demolition_king.user.vo.in.ProfileUpdateRequestVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationReResponseVo;
import com.e106.demolition_king.user.vo.out.ProfileResponseVo;
import com.e106.demolition_king.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Game", description = "게임 동작 API")
@RestController
@RequestMapping("/api/users/games")
@RequiredArgsConstructor
public class GameController {

    private final GameServiceImpl gameService;
    private final UserServiceImpl userService;
    private final JwtUtil jwtUtil;


    @Operation(
            summary     = "전체 프로필 조회",
            description = "전체 프로필 정보를 조회합니다."
    )
    @GetMapping("/profiles")
    public ResponseEntity<List<ProfileResponseVo>> findAll() {
        return ResponseEntity.ok(userService.getAllProfiles());
    }


    @Operation(
            summary     = "프로필 변경",
            description = "로그인한 사용자의 프로필을 다른 것으로 변경합니다."
    )
    @PatchMapping("/profile/change")
    public BaseResponse<Void> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProfileUpdateRequestVo vo
    ) {
        // 1) 헤더 및 토큰 검증
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return BaseResponse.error(BaseResponseStatus.INVALID_AUTH_HEADER);
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return BaseResponse.error(BaseResponseStatus.WRONG_JWT_TOKEN);
        }
        // 2) UUID 추출
        String userUuid = jwtUtil.getUserUuid(token);
        // 3) 서비스 호출
        userService.updateProfile(userUuid, vo.getProfileSeq());
        // 4) 응답
        return BaseResponse.ok();
    }





    @Operation(summary = "사용자 리포트 조회", description = "특정 사용자의 리포트 정보를 반환합니다.")
    @GetMapping("/{userUuid}/reports")
    public List<ReportResponseVo> getUserReports( @RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }

        String token = authorizationHeader.substring(7); // "Bearer " 제거

        // 2. 유효성 검사
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        // 3. UUID 추출
        String userUuid = jwtUtil.getUserUuid(token);

        return gameService.getUserReport(userUuid)
                .stream()
                .map(ReportResponseVo::fromDto)
                .collect(Collectors.toList());
    }
    @Operation(
            summary = "오늘자 플레이 시간 조회",
            description = "로그인된 유저의 오늘자 플레이 시간을 반환합니다 (yyyyMMdd 기준)."
    )
    @GetMapping("/today/playtime")
    public BaseResponse<PlayTimeResponseVo> getTodayPlayTime(
            @RequestHeader("Authorization") String authHeader
    ) {
        // 1) 토큰에서 UUID 추출
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        String userUuid = jwtUtil.getUserUuid(token);

        // 2) 서비스 호출
        BigDecimal playTime = gameService.getTodayPlayTimeDate(userUuid);

        // 3) 응답 DTO 생성 후 반환
        PlayTimeResponseVo vo = new PlayTimeResponseVo(playTime);
        return BaseResponse.of(vo);
    }

    @Operation(
            summary     = "이번주 플레이 시간 조회",
            description = "로그인된 유저의 이번주 플레이 정보를 반환합니다."
    )
    @GetMapping("/weekly")
    public ResponseEntity<List<WeeklyReportVo>> getWeeklyReports(
            @RequestHeader("Authorization") String authHeader) {

        // 1) 토큰에서 UUID 추출
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        String userUuid = jwtUtil.getUserUuid(token);

        // 2) 서비스 호출
        List<WeeklyReportVo> weekly = gameService.getWeeklyReports(userUuid);

        return ResponseEntity.ok(weekly);
    }

    @Operation(summary = "선택한 구간별 칼로리 정보", description = "선택한 기간의 칼로리 정보를 반환합니다.")
    @GetMapping("/kcal")
    public BaseResponse<List<KcalPerDayResponseVo>> getKcalData(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String start, // YYYY.MM.DD
            @RequestParam String end    // YYYY.MM.DD
    ) {
        // 1) 토큰에서 UUID 추출
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        String userUuid = jwtUtil.getUserUuid(token);

        // 2) 날짜 포맷 변환 (2025.08.01 → 20250801)
        String startDate = start.replace(".", "");
        String endDate = end.replace(".", "");

        // 3) 서비스 호출
        List<KcalPerDayResponseVo> kcalList = gameService.getKcalData(userUuid, startDate, endDate);

        // 4) 응답 생성
        return BaseResponse.of(kcalList);
    }

    @Operation(summary = "사용자 리포트 정보 갱신", description = "특정 사용자의 리포트 정보를 갱신합니다.")
    @PatchMapping("/reportUpdates")
    public BaseResponse<String> updateUserReports(
            @RequestHeader("Authorization") String authorizationHeader,
            @ParameterObject ReportUpdateRequestVo requestvo) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }

        String token = authorizationHeader.substring(7); // "Bearer " 제거
        // 2. 유효성 검사
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        // 3. UUID 추출
        String userUuid = jwtUtil.getUserUuid(token);

        requestvo.setUserUuid(userUuid);

        System.out.println("requestvo = " + requestvo);
        gameService.updateUserReport(requestvo.toDto(requestvo));
        return BaseResponse.of(" ");
    }

    @Operation(summary = "사용자의 일일 리포트 정보 갱신", description = "특정 사용자의 일일 리포트 정보를 갱신합니다.")
    @PatchMapping("/reportPerDateUpdates")
    public BaseResponse<String> upsertReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @ParameterObject ReportPerDateUpdateRequestVo vo) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }

        String token = authorizationHeader.substring(7); // "Bearer " 제거

        // 2. 유효성 검사
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        // 3. UUID 추출
        String userUuid = jwtUtil.getUserUuid(token);

        vo.setUserUuid(userUuid);

        gameService.upsertReport(vo.toDto(vo));
        return BaseResponse.of("일일 통계 저장 완료");
    }

    @Operation(summary = "게임 종료시 골드 업데이트", description = "게임 종료시 골드 업데이트")
    @PatchMapping("/addGoldCnt")
    public BaseResponse<String> upsertReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @ParameterObject GoldUpdateRequestVo vo) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }

        String token = authorizationHeader.substring(7); // "Bearer " 제거

        // 2. 유효성 검사
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        // 3. UUID 추출
        String userUuid = jwtUtil.getUserUuid(token);

        vo.setUserUuid(userUuid);

        gameService.updateGold(vo.toDto(vo));
        return BaseResponse.of("골드 저장 완료");
    }

    @Operation(summary = "회원 골드 조회", description = "회원의 골드를 조회합니다.")
    @GetMapping("/{userUuid}/getGoldByUuid")
    public BaseResponse<Integer> upsertReport( @RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }

        String token = authorizationHeader.substring(7); // "Bearer " 제거

        // 2. 유효성 검사
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        // 3. UUID 추출
        String userUuid = jwtUtil.getUserUuid(token);

        return BaseResponse.of(gameService.getGold(userUuid));
    }
    @Operation(summary = "게임 콤보 생성", description = "게임 콤보 세트 100개를 생성합니다.")
    @GetMapping("/generate/numeric")
    public ResponseEntity<PatternNumericResponse> generateNumeric() {
        return ResponseEntity.ok(gameService.generateNumeric());
    }

    // ✅ UUID 기반 - 사용자 리포트 정보 갱신
    @Operation(summary = "사용자 리포트 정보 갱신 (UUID 기반)", description = "특정 사용자의 리포트 정보를 UUID로 갱신합니다.")
    @PatchMapping("/reportUpdates/uuid")
    public BaseResponse<String> updateUserReportsByUuid(
            @RequestHeader(name = "X-User-Uuid", required = true) String userUuid,
            @ParameterObject ReportUpdateRequestVo requestvo
    ) {
        if (userUuid == null || userUuid.isBlank()) {
            throw new RuntimeException("유효하지 않은 사용자 UUID 헤더입니다.");
        }
        requestvo.setUserUuid(userUuid);
        gameService.updateUserReport(requestvo.toDto(requestvo));
        return BaseResponse.of(" ");
    }

    // ✅ UUID 기반 - 사용자의 일일 리포트 정보 갱신
    @Operation(summary = "사용자의 일일 리포트 정보 갱신 (UUID 기반)", description = "특정 사용자의 일일 리포트 정보를 UUID로 갱신합니다.")
    @PatchMapping("/reportPerDateUpdates/uuid")
    public BaseResponse<String> upsertReportPerDateByUuid(
            @RequestHeader(name = "X-User-Uuid", required = true) String userUuid,
            @ParameterObject ReportPerDateUpdateRequestVo vo
    ) {
        if (userUuid == null || userUuid.isBlank()) {
            throw new RuntimeException("유효하지 않은 사용자 UUID 헤더입니다.");
        }
        vo.setUserUuid(userUuid);
        gameService.upsertReport(vo.toDto(vo));
        return BaseResponse.of("일일 통계 저장 완료");
    }

    // ✅ UUID 기반 - 게임 종료시 골드 업데이트
    @Operation(summary = "게임 종료시 골드 업데이트 (UUID 기반)", description = "게임 종료시 골드를 UUID로 업데이트합니다.")
    @PatchMapping("/addGoldCnt/uuid")
    public BaseResponse<String> updateGoldOnGameEndByUuid(
            @RequestHeader(name = "X-User-Uuid", required = true) String userUuid,
            @ParameterObject GoldUpdateRequestVo vo
    ) {
        if (userUuid == null || userUuid.isBlank()) {
            throw new RuntimeException("유효하지 않은 사용자 UUID 헤더입니다.");
        }
        vo.setUserUuid(userUuid);
        gameService.updateGold(vo.toDto(vo));
        return BaseResponse.of("골드 저장 완료");
    }

}