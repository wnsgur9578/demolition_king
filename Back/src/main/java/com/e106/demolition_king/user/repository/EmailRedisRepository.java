package com.e106.demolition_king.user.repository;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import java.util.concurrent.TimeUnit;                 // ← 추가!
import org.springframework.data.redis.core.RedisTemplate;  // ← 추가!

@Repository
public class EmailRedisRepository {
    private final StringRedisTemplate redis;

    public EmailRedisRepository(StringRedisTemplate redis) {
        this.redis = redis;
    }

    private String key(String prefix, String email) {
        return prefix + email;
    }

    /** 인증 코드 저장 (10분 TTL) */
    public void saveCode(String prefix, String email, String code) {
        redis.opsForValue().set(key(prefix, email), code, 600, TimeUnit.SECONDS);
    }

    /** 인증 코드 조회 */
    public String getCode(String prefix, String email) {
        return redis.opsForValue().get(key(prefix, email));
    }

    /** 인증 코드 삭제 */
    public void delete(String prefix, String email) {
        redis.delete(key(prefix, email));
    }

}