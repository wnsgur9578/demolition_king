package com.e106.demolition_king.config;

import com.e106.demolition_king.friend.websocket.StompHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@RequiredArgsConstructor
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompHandshakeInterceptor stompHandshakeInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 SockJS 통해 연결할 엔드포인트 지정
        registry.addEndpoint("/ws")
                .addInterceptors(stompHandshakeInterceptor, new HttpSessionHandshakeInterceptor())
                .setAllowedOriginPatterns("*")
                .withSockJS(); // SockJS fallback 사용
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 메시지 브로커 설정: /topic, /queue는 서버가 메시지 전달하는 채널
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트가 서버로 보낼 때 붙이는 prefix
        config.setApplicationDestinationPrefixes("/app");
        // 1:1 메시지 보내기용 prefix
        config.setUserDestinationPrefix("/user");
    }
}
