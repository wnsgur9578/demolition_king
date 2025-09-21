package com.e106.demolition_king.common.util;

import java.security.SecureRandom;

public class CodeGenerator {
    private static final String ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * 알파벳 대문자+숫자로 구성된 랜덤 코드를 생성합니다.
     * @param length 원하는 길이 (예: 6)
     * @return 생성된 코드
     * 사용처 : 이메일 인증시 랜덤 코드 생성
     */
    public static String generate(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }
}
