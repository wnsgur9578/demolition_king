package com.e106.demolition_king.friend.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class FriendRedisService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private String getKey(String userUuid) {
        return "pending-requests:" + userUuid;
    }

    public void savePendingRequest(String receiverUuid, String senderUuid, String senderNickname) {
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "userUuid", senderUuid,
                    "userNickname", senderNickname
            ));
            redisTemplate.opsForList().rightPush(getKey(receiverUuid), json);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public void sendAndDeletePendingRequests(String receiverUuid, FriendWebSocketService webSocketService) {
        ListOperations<String, String> ops = redisTemplate.opsForList();
        String key = getKey(receiverUuid);

        while (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            String json = ops.leftPop(key);
            if (json == null) break;

            try {
                Map<String, String> payload = objectMapper.readValue(json, Map.class);
                webSocketService.sendFriendRequest(receiverUuid, payload.get("userUuid"), payload.get("userNickname"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        redisTemplate.delete(key);
    }
}
