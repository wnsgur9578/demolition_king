package com.e106.demolition_king.friend.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitters {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void add(String userUuid, SseEmitter emitter) {
        emitters.put(userUuid, emitter);
    }

    public void remove(String userUuid) {
        emitters.remove(userUuid);
    }

    // 기존 friend-request 전송 메소드 유지
    public void send(String userUuid, String message) {
        send(userUuid, "friend-request", message);
    }

    // 이벤트 이름을 지정할 수 있는 범용 전송 메소드 추가
    public void send(String userUuid, String eventName, String message) {
        SseEmitter emitter = emitters.get(userUuid);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(message));
            } catch (IOException e) {
                emitters.remove(userUuid);
            }
        }
    }

    public boolean isOnline(String userUuid) {
        return emitters.containsKey(userUuid);
    }
}
