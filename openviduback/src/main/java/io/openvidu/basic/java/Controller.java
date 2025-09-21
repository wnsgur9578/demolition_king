package io.openvidu.basic.java;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.RoomServiceClient;
import io.livekit.server.WebhookReceiver;

import livekit.LivekitWebhook.WebhookEvent; // webhook protobuf
import retrofit2.HttpException; // 409 처리용

@CrossOrigin(origins = "*")
@RestController
public class Controller {

    @Value("${livekit.api.key}")
    private String LIVEKIT_API_KEY;

    @Value("${livekit.api.secret}")
    private String LIVEKIT_API_SECRET;

    // ws가 아니라 http/https 엔드포인트 (기본값 로컬)
    @Value("${livekit.url}")
    private String LIVEKIT_URL_HTTP;

    /** 필요할 때마다 클라이언트 생성 */
    private RoomServiceClient rsc() {
        return RoomServiceClient.createClient(
                LIVEKIT_URL_HTTP, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
        );
    }

    /** 방이 없으면 만들기(이미 있으면 409 무시) */
    private void ensureRoom(String roomName) throws Exception {
        try {
            rsc().createRoom(roomName).execute(); // 간단 생성
        } catch (HttpException e) {
            if (e.code() != 409) throw e; // 이미 있으면 OK, 그 외 에러만 전파
        }
    }

    /**
     * 토큰 발급 (+ 방 자동 생성)
     * body: { roomName?: string, nickName?: string, userUuid: string }
     * 항상 { token, roomName } 반환
     */
    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> createToken(@RequestBody Map<String, Object> params) {
        try {
            String nickName = Optional.ofNullable((String) params.get("nickName")).orElse("player");
            String userUuid = (String) params.get("userUuid");
            if (userUuid == null || userUuid.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("errorMessage", "userUuid is required"));
            }

            String roomName = (String) params.get("roomName");
            if (roomName == null || roomName.isBlank()) {
                roomName = UUID.randomUUID().toString(); // 방 이름 자동 생성
            }

            // 방이 없으면 생성 (중복은 409 무시)
            ensureRoom(roomName);

            // 토큰 발급
            AccessToken token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
            token.setName(nickName);
            token.setIdentity(userUuid);
            token.addGrants(new RoomJoin(true), new RoomName(roomName));

            return ResponseEntity.ok(Map.of(
                    "token", token.toJwt(),
                    "roomName", roomName
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("errorMessage", e.getMessage()));
        }
    }

    /** LiveKit Webhook 수신 */
    @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
    public ResponseEntity<String> receiveWebhook(@RequestHeader("Authorization") String authHeader,
                                                 @RequestBody String body) {
        WebhookReceiver webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
        try {
            WebhookEvent event = webhookReceiver.receive(body, authHeader);
            System.out.println("LiveKit Webhook: " + event);
        } catch (Exception e) {
            System.err.println("Error validating webhook event: " + e.getMessage());
        }
        return ResponseEntity.ok("ok");
    }

    /* =========================
       ⬇⬇⬇ 여기부터 “추가” 코드 ⬇⬇⬇
       ========================= */

    /** 방 존재 여부 체크(listRooms 사용). import로 livekit.Room 안 끌어옴 */
    // import 안 늘리지 않으려면 이렇게 완전수식 타입으로 작성
    private boolean roomExists(String roomName) {
        try {
            retrofit2.Response<java.util.List<livekit.LivekitModels.Room>> resp =
                    rsc().listRooms().execute();

            java.util.List<livekit.LivekitModels.Room> rooms = resp.body();
            if (rooms == null) return false;

            for (livekit.LivekitModels.Room rm : rooms) {
                if (roomName.equals(rm.getName())) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("roomExists failed: " + e.getMessage(), e);
        }
    }

    /* ✅ 최대 인원 제한 */
    private static final int MAX_PARTICIPANTS = 4;

    /* ✅ 현재 방 참가자 수 조회 */
    private int participantCount(String roomName) {
        try {
            retrofit2.Response<java.util.List<livekit.LivekitModels.ParticipantInfo>> resp =
                    rsc().listParticipants(roomName).execute();
            java.util.List<livekit.LivekitModels.ParticipantInfo> list = resp.body();
            return (list == null) ? 0 : list.size();
        } catch (Exception e) {
            throw new RuntimeException("participantCount failed: " + e.getMessage(), e);
        }
    }

    /* ✅ 방이 꽉 찼는지 여부 */
    private boolean roomFull(String roomName) {
        return participantCount(roomName) >= MAX_PARTICIPANTS;
    }

    /**
     * 엄격 모드 토큰 발급:
     * - action=create: 동일 이름 방이 이미 있으면 409
     * - action=join:   방이 없으면 404, 정원 초과면 409 ("방이 꽉 찼습니다")
     *
     * body: { roomName?: string, nickName?: string, userUuid: string, action?: 'create'|'join', identityOverride?: string }
     * ok:   { token, roomName }
     */
    @PostMapping("/token/strict")
    public ResponseEntity<Map<String, String>> createTokenStrict(@RequestBody Map<String, Object> params) {
        try {
            String nickName = Optional.ofNullable((String) params.get("nickName")).orElse("player");
            String userUuid = (String) params.get("userUuid");
            if (userUuid == null || userUuid.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("errorMessage", "userUuid is required"));
            }

            String action = Optional.ofNullable((String) params.get("action")).orElse("create"); // 기본 create
            String roomName = (String) params.get("roomName");
            String identityOverride = Optional.ofNullable((String) params.get("identityOverride")).orElse(null);

            if ("join".equals(action)) {
                // 참가: roomName 필수
                if (roomName == null || roomName.isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of("errorMessage", "roomName is required for join"));
                }
                if (!roomExists(roomName)) {
                    return ResponseEntity.status(404).body(Map.of("errorMessage", "Room not found"));
                }
                // ✅ 인원 제한 체크
                if (roomFull(roomName)) {
                    return ResponseEntity.status(409).body(Map.of(
                            "errorMessage", "방이 꽉 찼습니다",
                            "code", "ROOM_FULL",
                            "max", String.valueOf(MAX_PARTICIPANTS)
                    ));
                }

            } else if ("create".equals(action)) {
                // 생성: roomName 없으면 자동 생성 허용
                if (roomName == null || roomName.isBlank()) {
                    roomName = java.util.UUID.randomUUID().toString();
                } else {
                    if (roomExists(roomName)) {
                        return ResponseEntity.status(409).body(Map.of("errorMessage", "Room already exists"));
                    }
                }
                ensureRoom(roomName); // 생성 시엔 인원 제한 없음 (참가 시점에서 가드)

            } else {
                return ResponseEntity.badRequest().body(Map.of("errorMessage", "invalid action"));
            }

            // 토큰 발급 (프론트가 보낸 identityOverride가 있으면 사용)
            String identityToUse = (identityOverride != null && !identityOverride.isBlank())
                    ? identityOverride
                    : userUuid;

            AccessToken token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
            token.setName(nickName);
            token.setIdentity(identityToUse);
            token.addGrants(new RoomJoin(true), new RoomName(roomName));

            return ResponseEntity.ok(Map.of(
                    "token", token.toJwt(),
                    "roomName", roomName
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("errorMessage", e.getMessage()));
        }
    }

    /** 프리체크: 방 존재 여부 */
    @GetMapping("/room-exists")
    public Map<String, Object> roomExistsApi(@RequestParam String roomName) {
        return Map.of("exists", roomExists(roomName));
    }

    /** (선택) 프리체크: 현재 인원수 — 프론트에서 버튼 비활성화 등에 사용 가능 */
    @GetMapping("/room-count")
    public Map<String, Object> roomCountApi(@RequestParam String roomName) {
        if (!roomExists(roomName)) {
            return Map.of("exists", false, "count", 0, "max", MAX_PARTICIPANTS, "full", false);
        }
        int count = participantCount(roomName);
        return Map.of("exists", true, "count", count, "max", MAX_PARTICIPANTS, "full", count >= MAX_PARTICIPANTS);
    }
}
