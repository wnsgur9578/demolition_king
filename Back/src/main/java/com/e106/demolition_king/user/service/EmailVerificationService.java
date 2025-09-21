package com.e106.demolition_king.user.service;

import com.e106.demolition_king.user.dto.EmailSendCodeDto;
import com.e106.demolition_king.user.vo.in.EmailVerificationReRequestVo;
import com.e106.demolition_king.user.vo.in.EmailVerificationRequestVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationReResponseVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationResponseVo;

import java.sql.SQLException;

public interface EmailVerificationService {

    //회원가입 시
    EmailVerificationResponseVo sendSignupCode(EmailVerificationRequestVo req);
    EmailVerificationReResponseVo checkSignupCode(EmailVerificationReRequestVo req);

    // 이메일 발송
    EmailVerificationResponseVo sendCode(EmailVerificationRequestVo req);

    // 이메일 수신 체크
    EmailVerificationReResponseVo checkCode(EmailVerificationReRequestVo req);

    //
}
