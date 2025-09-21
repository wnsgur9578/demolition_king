package com.e106.demolition_king.user.controller;

import com.e106.demolition_king.common.base.BaseResponse;
import com.e106.demolition_king.user.service.EmailVerificationService;
import com.e106.demolition_king.user.vo.in.EmailVerificationReRequestVo;
import com.e106.demolition_king.user.vo.in.EmailVerificationRequestVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationReResponseVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationResponseVo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;


@RestController
@Log4j2
@RequestMapping("/api/v1/user/email")
@RequiredArgsConstructor
@Tag(name = "이메일 인증", description = "이메일 인증 관련 API")
public class EmailVerificationController {
    private final EmailVerificationService service;

    // ─── 회원가입용 인증 ───────────────────────────────

    @Operation(
            summary = "회원가입용 인증 코드 전송",
            description = "회원가입 전 사용자가 입력한 이메일로 인증 코드를 전송합니다.",
            tags = {"이메일 인증"}
    )
    @PostMapping("/signup/send")
    public BaseResponse<EmailVerificationResponseVo> sendSignupCode(
            @RequestBody EmailVerificationRequestVo requestVo) {
        EmailVerificationResponseVo response = service.sendSignupCode(requestVo);
        return BaseResponse.of(response);
    }

    @Operation(
            summary = "회원가입용 인증 코드 검증",
            description = "회원가입 과정에서 받은 인증 코드를 확인합니다.",
            tags = {"이메일 인증"}
    )
    @PostMapping("/signup/verify")
    public BaseResponse<EmailVerificationReResponseVo> verifySignupCode(
            @RequestBody EmailVerificationReRequestVo requestVo) {
        EmailVerificationReResponseVo response = service.checkSignupCode(requestVo);
        return BaseResponse.of(response);
    }

    // ─── 비밀번호 재설정용 인증 ─────────────────────────

    @Operation(
            summary = "비밀번호 재설정용 인증 코드 전송",
            description = "비밀번호 찾기 화면에서 입력한 이메일로 인증 코드를 전송합니다.",
            tags = {"이메일 인증"}
    )
    @PostMapping("/reset/send")
    public BaseResponse<EmailVerificationResponseVo> sendResetCode(
            @RequestBody EmailVerificationRequestVo requestVo) {
        EmailVerificationResponseVo response = service.sendCode(requestVo);
        return BaseResponse.of(response);
    }

    @Operation(
            summary = "비밀번호 재설정용 인증 코드 검증",
            description = "비밀번호 재설정 화면으로 넘어가기 전 인증 코드를 확인합니다.",
            tags = {"이메일 인증"}
    )
    @PostMapping("/reset/verify")
    public BaseResponse<EmailVerificationReResponseVo> verifyResetCode(
            @RequestBody EmailVerificationReRequestVo requestVo) {
        EmailVerificationReResponseVo response = service.checkCode(requestVo);
        return BaseResponse.of(response);
    }

}

