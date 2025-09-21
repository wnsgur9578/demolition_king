package com.e106.demolition_king.user.service;

public enum VerificationType {
    SIGNUP(
            "email:signup:",
            "[철거왕 김주먹] 회원가입 인증 코드",
            "회원가입을 위한 인증 코드입니다."
    ),
    PASSWORD_RESET(
            "email:pwreset:",
            "[철거왕 김주먹] 비밀번호 재설정 인증 코드",
            "비밀번호 재설정을 위한 인증 코드입니다."
    );

    private final String redisPrefix;
    private final String emailSubject;
    private final String emailBodyIntro;

    VerificationType(String redisPrefix, String emailSubject, String emailBodyIntro) {
        this.redisPrefix = redisPrefix;
        this.emailSubject = emailSubject;
        this.emailBodyIntro = emailBodyIntro;
    }

    public String getRedisPrefix() { return redisPrefix; }
    public String getEmailSubject() { return emailSubject; }
    public String getEmailBodyIntro() { return emailBodyIntro; }
}
