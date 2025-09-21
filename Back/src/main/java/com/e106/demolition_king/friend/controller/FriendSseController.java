package com.e106.demolition_king.friend.controller;

import com.e106.demolition_king.friend.sse.SseEmitters;
import com.e106.demolition_king.friend.websocket.PresenceService;
import com.e106.demolition_king.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sse")
public class FriendSseController {

    private final SseEmitters sseEmitters;
    private final JwtUtil jwtUtil;
    private final PresenceService presenceService;

    @GetMapping("/subscribe")
    public SseEmitter subscribe(@RequestParam("token") String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        String userUuid = jwtUtil.getUserUuid(token);

        // ✅ Redis에 온라인 상태 등록
        presenceService.setOnline(userUuid);

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseEmitters.add(userUuid, emitter);

        Runnable removeAndOffline = () -> {
            presenceService.setOffline(userUuid);
            sseEmitters.remove(userUuid);
        };

        emitter.onCompletion(removeAndOffline);
        emitter.onTimeout(removeAndOffline);
        emitter.onError(e -> removeAndOffline.run());

        return emitter;
    }


    // 공통 JWT 파싱 메서드
    private String extractUuidFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization 헤더가 잘못되었습니다.");
        }
        String token = authorizationHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        return jwtUtil.getUserUuid(token);
    }
}
