package com.e106.demolition_king.friend.controller;


import com.e106.demolition_king.common.base.BaseResponse;
import com.e106.demolition_king.friend.dto.FriendRequestDto;
import com.e106.demolition_king.friend.service.FriendService;
import com.e106.demolition_king.friend.vo.in.RoomInviteRequestVo;
import com.e106.demolition_king.friend.vo.out.FriendStatusVo;
import com.e106.demolition_king.user.service.UserService;
import com.e106.demolition_king.user.vo.out.UserSearchResponseVo;
import com.e106.demolition_king.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Friend", description = "친구 목록 조회 API")
@RestController
@RequestMapping("/api/users/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "방 초대 전송",
            description = "헤더에 내 UUID(X-User-Uuid)와 친구 UUID(Friend-Uuid), 쿼리파라미터 roomName을 담아 SSE 초대 알림을 보냅니다."
    )
    @PostMapping("/invite-room")
    public BaseResponse<Void> inviteRoom(
            @RequestHeader("X-User-Uuid")
            @Schema(description = "보내는 사람(나)의 UUID") String senderUuid,
            @RequestHeader("Friend-Uuid")
            @Schema(description = "초대할 친구의 UUID") String friendUuid,
            @RequestParam("roomName")
            @Schema(description = "방 이름", example = "복싱연습방-7") String roomName
    ) {
        // 간단 검증
        if (senderUuid == null || senderUuid.isBlank()) {
            throw new RuntimeException("X-User-Uuid 헤더가 비어있습니다.");
        }
        if (friendUuid == null || friendUuid.isBlank()) {
            throw new RuntimeException("Friend-Uuid 헤더가 비어있습니다.");
        }
        if (roomName == null || roomName.isBlank()) {
            throw new RuntimeException("roomName 파라미터가 비어있습니다.");
        }
        if (senderUuid.equals(friendUuid)) {
            throw new RuntimeException("본인에게는 초대할 수 없습니다.");
        }

        // 서비스 호출
        friendService.sendRoomInvite(senderUuid, friendUuid, roomName);

        return BaseResponse.ok();
    }


    @Operation(
            summary = "닉네임으로 유저 조회",
            description = "친구 추가를 위해, 유저 닉네임으로 해당 유저 정보를 가져옵니다."
    )
    @GetMapping("/search")
    public BaseResponse<UserSearchResponseVo> searchByNickname(
            @RequestParam("nickname") String nickname
    ) {
        UserSearchResponseVo vo = userService.findByNickname(nickname);
        return BaseResponse.of(vo);
    }

    @Operation(summary = "초대 가능한 친구 목록 조회", description = "FRIEND 상태이며 현재 온라인 중인 친구만 반환")
    @GetMapping("/invite-targets")
    public BaseResponse<List<FriendStatusVo>> listInvitableFriends(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        List<FriendStatusVo> inviteTargets = friendService.getInvitableFriends(userUuid);
        return BaseResponse.of(inviteTargets);
    }



    @Operation(summary = "받은 친구 요청 목록 조회")
    @GetMapping("/requests")
    public BaseResponse<List<FriendStatusVo>> listFriendRequests(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        List<FriendStatusVo> pendingList = friendService.getPendingRequestList(userUuid);
        return BaseResponse.of(pendingList);
    }

    @Operation(summary = "친구 요청 보내기")
    @PostMapping("/invite")
    public ResponseEntity<String> sendFriendRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String friendUuid
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        FriendRequestDto requestDto = new FriendRequestDto();
        requestDto.setFriendUuid(friendUuid);

        friendService.sendFriendRequest(userUuid, requestDto);
        return ResponseEntity.ok("친구 요청이 전송되었습니다.");
    }


    @Operation(summary = "친구 목록 + 온라인 상태 조회", description = "친구 목록과 온라인 상태를 반환(내 uuid 기준)")
    @GetMapping("/status")
    public BaseResponse<List<FriendStatusVo>> listFriendsWithStatus(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        List<FriendStatusVo> friendStatusList = friendService.getFriendListWithStatus(userUuid);
        return BaseResponse.of(friendStatusList);
    }

    @Operation(summary = "친구 요청 수락")
    @PatchMapping("/accept")
    public ResponseEntity<String> acceptFriendRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String friendUuid
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        friendService.acceptFriendRequest(userUuid, friendUuid);
        return ResponseEntity.ok("친구 요청을 수락했습니다.");
    }

    @Operation(summary = "친구 요청 거절")
    @DeleteMapping("/reject")
    public ResponseEntity<String> rejectFriendRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String friendUuid
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        friendService.rejectFriendRequest(userUuid, friendUuid);
        return ResponseEntity.ok("친구 요청을 거절했습니다.");
    }

    @Operation(summary = "친구 삭제")
    @DeleteMapping
    public ResponseEntity<String> deleteFriend(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String friendUuid
    ) {
        String userUuid = extractUuidFromHeader(authorizationHeader);
        friendService.deleteFriend(userUuid, friendUuid);
        return ResponseEntity.ok("친구가 삭제되었습니다.");
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
