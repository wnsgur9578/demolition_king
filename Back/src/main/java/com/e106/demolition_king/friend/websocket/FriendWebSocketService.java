package com.e106.demolition_king.friend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FriendWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendFriendRequest(String receiverUuid, String senderUuid, String senderNickname) {
        Map<String, String> payload = new HashMap<>();
        payload.put("userUuid", senderUuid);
        payload.put("userNickname", senderNickname);

        messagingTemplate.convertAndSendToUser(
                receiverUuid,
                "/queue/friend-request",
                payload
        );
    }
}
