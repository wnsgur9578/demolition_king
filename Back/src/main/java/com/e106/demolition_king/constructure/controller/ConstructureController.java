package com.e106.demolition_king.constructure.controller;


import com.e106.demolition_king.common.base.BaseResponse;
import com.e106.demolition_king.constructure.service.ConstructureService;
import com.e106.demolition_king.constructure.vo.in.ConstructureByEventInVo;
import com.e106.demolition_king.constructure.vo.in.ConstructureSaveRequestVo;
import com.e106.demolition_king.constructure.vo.out.ConstructureResponseVo;
import com.e106.demolition_king.constructure.vo.out.GetConstructureResponseVo;
import com.e106.demolition_king.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/constructures")
@Tag(name = "Game", description = "게임 동작 API")
@RequiredArgsConstructor
public class ConstructureController {

    private final ConstructureService constructureService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "건물 생성 요청", description = "입력 개수에 맞춰 확률적으로 건물 생성")
    @GetMapping("/generate")
    public BaseResponse<List<ConstructureResponseVo>> generateConstructures(@RequestParam int count) {
        List<ConstructureResponseVo> generated = constructureService.generateConstructures(count);
        return BaseResponse.of(generated);
    }

    @Operation(summary = "파괴된 건물 사용자 건물 테이블에 Insert", description = "파괴된 건물 테이블 리스트 받아서 밀어 넣기")
    @PostMapping("/save")
    public BaseResponse<Void> saveConstructures(
            @RequestBody ConstructureSaveRequestVo request) {

        constructureService.insertNewConstructures(request.getUserUuid(), request.getConstructureSeqList());
        return BaseResponse.ok();
    }

    @Operation(summary = "사용자 건물 조회", description = "사용자가 해금한 건물 조회")
    @GetMapping("/getConstructure")
    public BaseResponse<List<GetConstructureResponseVo>> generateConstructures(@RequestHeader("Authorization") String authorizationHeader) {
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

        List<GetConstructureResponseVo> generated = constructureService.getUserConstructures(userUuid);
        return BaseResponse.of(generated);
    }

    @Operation(summary = "이벤트 건물 정보 반환",
            description = "isEventK + id로 name(eventk{id}|eventw{id})을 만들고, 해당 건물을 반환합니다.")
    @GetMapping("/by-event")
    public BaseResponse<ConstructureResponseVo> getByEvent(@ParameterObject ConstructureByEventInVo inVo) {
        return BaseResponse.of(constructureService.getByEvent(inVo));
    }

    @Operation(summary = "사용자 이벤트 건물 전체 조회",
            description = "이벤트 건물만 대상으로, 유저 해금 여부(isOpen)를 포함하여 전체 목록을 반환합니다.")
    @GetMapping("/events")
    public BaseResponse<List<GetConstructureResponseVo>> getUserEventConstructures(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }
        String token = authorizationHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        String userUuid = jwtUtil.getUserUuid(token);

        List<GetConstructureResponseVo> result = constructureService.getUserEventConstructures(userUuid);
        return BaseResponse.of(result);
    }
}