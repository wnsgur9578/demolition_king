package com.e106.demolition_king.skin.controller;


import com.e106.demolition_king.common.base.BaseResponse;
import com.e106.demolition_king.constructure.service.ConstructureService;
import com.e106.demolition_king.constructure.vo.in.ConstructureSaveRequestVo;
import com.e106.demolition_king.constructure.vo.out.ConstructureResponseVo;
import com.e106.demolition_king.constructure.vo.out.GetConstructureResponseVo;
import com.e106.demolition_king.skin.service.SkinServiceImpl;
import com.e106.demolition_king.skin.vo.in.SelectSkinRequestVo;
import com.e106.demolition_king.skin.vo.out.SkinInfoResponseVo;
import com.e106.demolition_king.skin.vo.out.getSkinResponseVo;
import com.e106.demolition_king.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skins")
@Tag(name = "Skin", description = "스킨 관련 API")
@RequiredArgsConstructor
public class SkinController {

    private final SkinServiceImpl skinService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "스킨 선택", description = "원하는 스킨을 선택하여 플레이용 스킨 적용")
    @GetMapping("/selectSkin")
    public BaseResponse<String> generateConstructures(
            @RequestHeader("Authorization") String authorizationHeader,
            @ParameterObject SelectSkinRequestVo vo) {

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

        skinService.selectSkin(vo.getUserUuid(), vo.getPlayerSkinItemSeq());
        return BaseResponse.of("스킨 선택 완료");
    }

    @Operation(summary = "선택된 스킨 url 조회", description = "회원의 선택된 스킨 url을 가져옵니다.")
    @GetMapping("/getSkin")
    public BaseResponse<SkinInfoResponseVo> generateConstructures(@RequestHeader("Authorization") String authorizationHeader) {
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

        return BaseResponse.of(skinService.getSelectedSkinInfo(userUuid));
    }

    @Operation(summary = "uuid로 선택된 스킨 url 조회", description = "uuid로 회원의 선택된 스킨 url을 가져옵니다.")
    @GetMapping("/getSkinByUuid")
    public BaseResponse<SkinInfoResponseVo> getSkinByUserUuid(@RequestParam String userUuid) {
        return BaseResponse.of(skinService.getSelectedSkinInfo(userUuid));
    }

//    uuid로 조회하여 전체 스킨정보 조회 여기다 짜줘
    @Operation(summary = "전체 스킨정보 조회", description = "uuid로 조회하여 전체 스킨정보를 조회합니다.")
    @GetMapping("/getUserSkin")
    public BaseResponse<List<getSkinResponseVo>> getUserSkins(
            @RequestHeader("Authorization") String authorizationHeader) {
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
        return BaseResponse.of(skinService.getUserSkinList(userUuid));
    }

    //    스킨 구매시 해금 update
    @Operation(summary = "스킨 구매", description = "회원의 골드로 스킨을 구매하여 해금합니다.")
    @PatchMapping("/unLockUserSkin")
    public BaseResponse<String> getUserSkins(
            @RequestHeader("Authorization") String authorizationHeader,
            @ParameterObject SelectSkinRequestVo vo) {
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
// 스킨 해금과 vo 동일해서 재사용
        return BaseResponse.of(skinService.unlockPlayerSkin(vo));
    }

}
