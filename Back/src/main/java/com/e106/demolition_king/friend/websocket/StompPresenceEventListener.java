package com.e106.demolition_king.friend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.messaging.Message;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class StompPresenceEventListener {

    private final PresenceService presenceService;
    private final FriendRedisService friendRedisService;
    private final FriendWebSocketService friendWebSocketService;

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(event.getMessage(), StompHeaderAccessor.class);
        String userUuid = (String) accessor.getSessionAttributes().get("userUuid");

        if (userUuid != null) {
            presenceService.setOnline(userUuid);
            friendRedisService.sendAndDeletePendingRequests(userUuid, friendWebSocketService);
            System.out.println("✅ WebSocket 접속: " + userUuid);
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String userUuid = extractUserUuid(event.getMessage());

        if (userUuid != null) {
            presenceService.setOffline(userUuid);
            System.out.println("❌ WebSocket 연결 종료: " + userUuid);
        }
    }

    private String extractUserUuid(Message<?> message) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && accessor.getSessionAttributes() != null) {
            return (String) accessor.getSessionAttributes().get("userUuid");
        }
        return null;
    }
}
