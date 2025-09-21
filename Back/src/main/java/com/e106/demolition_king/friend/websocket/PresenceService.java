package com.e106.demolition_king.friend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final long ONLINE_TTL_SECONDS = 30;

    public void setOnline(String userUuid) {
        redisTemplate.opsForValue().set("online:" + userUuid, "true", ONLINE_TTL_SECONDS, TimeUnit.SECONDS);
    }

    public void refreshOnline(String userUuid) {
        redisTemplate.expire("online:" + userUuid, ONLINE_TTL_SECONDS, TimeUnit.SECONDS);
    }

    public void setOffline(String userUuid) {
        redisTemplate.delete("online:" + userUuid);
    }

    public boolean isOnline(String userUuid) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("online:" + userUuid));
    }
}
