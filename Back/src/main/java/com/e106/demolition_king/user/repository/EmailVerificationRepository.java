package com.e106.demolition_king.user.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EmailVerificationRepository {
    private final JdbcTemplate jdbc;

    public EmailVerificationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** 이메일이 이미 가입된 상태인지(true) 아닌지(false) 리턴 */
    public boolean existsByEmail(String email) {
        Integer cnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user WHERE user_email = ?",
                Integer.class, email);
        return cnt != null && cnt > 0;
    }
}