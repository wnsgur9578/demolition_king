package com.e106.demolition_king.user.service;

import com.e106.demolition_king.common.exception.BaseException;
import com.e106.demolition_king.common.base.BaseResponseStatus;
import com.e106.demolition_king.user.repository.EmailRedisRepository;
import com.e106.demolition_king.user.repository.EmailVerificationRepository;
import com.e106.demolition_king.user.vo.in.EmailVerificationReRequestVo;
import com.e106.demolition_king.user.vo.in.EmailVerificationRequestVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationReResponseVo;
import com.e106.demolition_king.user.vo.out.EmailVerificationResponseVo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private final EmailVerificationRepository dao;
    private final EmailRedisRepository      redisRepo;
    private final JavaMailSender            mailSender;

    private EmailVerificationResponseVo send(VerificationType type, String email, boolean mustExist) {
        log.info("{} 인증 요청 → {}", type.name(), email);

        boolean exists = dao.existsByEmail(email);
        if (mustExist ? !exists : exists) {
            String msg = mustExist
                    ? "가입되지 않은 이메일입니다."
                    : "이미 가입된 이메일입니다.";
            return EmailVerificationResponseVo.builder()
                    .available(false)
                    .message(msg)
                    .build();
        }

        // 2) 인증 코드 생성 (6자리, 대문자+숫자)
        String code = UUID.randomUUID()
                .toString()
                .replaceAll("-", "")
                .substring(0, 6)
                .toUpperCase();
        log.debug("생성된 인증 코드 [{}] → {}", code, email);

        // 3) Redis에 10분간 저장
        redisRepo.saveCode(type.getRedisPrefix(), email, code);
        log.debug("Redis 저장 ({}): {}", type.getRedisPrefix(), code);

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject(type.getEmailSubject());
            msg.setText(
                    "안녕하세요,\n" +
                            type.getEmailBodyIntro() + "\n\n" +
                            "🔒 인증 코드: " + code + "\n" +
                            "⏰ 유효 시간: 10분\n\n" +
                            "감사합니다."
            );
            mailSender.send(msg);
            log.info("메일 전송 성공 → {}", email);

            return EmailVerificationResponseVo.builder()
                    .available(true)
                    .message("인증 코드가 메일로 발송되었습니다.")
                    .build();
        } catch (Exception e) {
            log.error("메일 전송 실패 → {}", email, e);
            throw new BaseException(BaseResponseStatus.EMAIL_SEND_FAIL);
        }
    }

    // 공통: 코드 검증 로직
    private EmailVerificationReResponseVo check(VerificationType type, String email, String inputCode) {
        log.info("{} 코드 확인 → {}", type.name(), email);

        String saved = redisRepo.getCode(type.getRedisPrefix(), email);
        boolean ok = saved != null && saved.equals(inputCode);

        String message = ok
                ? "인증 성공"
                : "인증 코드가 일치하지 않거나 만료되었습니다.";

        return EmailVerificationReResponseVo.builder()
                .available(ok)
                .message(message)
                .build();
    }

    // ─────────── 회원가입용 ───────────
    public EmailVerificationResponseVo sendSignupCode(EmailVerificationRequestVo req) {
        return send(VerificationType.SIGNUP, req.getEmail(), /*mustExist=*/false);
    }

    public EmailVerificationReResponseVo checkSignupCode(EmailVerificationReRequestVo req) {
        return check(VerificationType.SIGNUP, req.getEmail(), req.getCode());
    }

    // ─────────── 비밀번호 재설정용 ───────────
    @Override
    public EmailVerificationResponseVo sendCode(EmailVerificationRequestVo req) {
        return send(VerificationType.PASSWORD_RESET, req.getEmail(), /*mustExist=*/true);
    }

    @Override
    public EmailVerificationReResponseVo checkCode(EmailVerificationReRequestVo req) {
        return check(VerificationType.PASSWORD_RESET, req.getEmail(), req.getCode());
    }

}
