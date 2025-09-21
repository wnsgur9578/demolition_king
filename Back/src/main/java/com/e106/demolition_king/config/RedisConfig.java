package com.e106.demolition_king.config;

import org.springframework.beans.factory.annotation.Value;                   // ← 반드시!
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration cfg = new RedisStandaloneConfiguration();
        cfg.setHostName(redisHost);
        cfg.setPort(redisPort);
        if (!redisPassword.isBlank()) {
            cfg.setPassword(redisPassword);
        }
        return new LettuceConnectionFactory(cfg);
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(
            LettuceConnectionFactory connectionFactory) {
        // 1) 템플릿 객체 생성
        RedisTemplate<String, String> tpl = new RedisTemplate<>();

        // 2) Redis 서버와의 연결 정보 주입
        tpl.setConnectionFactory(connectionFactory);

        // 3) 직렬화 방식 지정
        StringRedisSerializer s = new StringRedisSerializer();
        tpl.setKeySerializer(s);         // 일반 키를 String ↔ byte[] 로 변환
        tpl.setValueSerializer(s);       // 일반 값(value)도 String ↔ byte[]
        tpl.setHashKeySerializer(s);     // 해시(Hash) 구조의 키도 String
        tpl.setHashValueSerializer(s);   // 해시(Hash) 구조의 값도 String

        // 4) 내부 프로퍼티 적용 완료
        tpl.afterPropertiesSet();
        return tpl;
    }
}
