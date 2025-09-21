package com.e106.demolition_king.friend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.Message;

@Controller
@RequiredArgsConstructor
public class HeartbeatController {

    private final PresenceService presenceService;

    @MessageMapping("/heartbeat")
    public void handleHeartbeat(Message<?> message) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        String userUuid = (String) accessor.getSessionAttributes().get("userUuid");

        if (userUuid != null) {
            presenceService.refreshOnline(userUuid);
            System.out.println("💓 Heartbeat received from: " + userUuid);
        }
    }
}
