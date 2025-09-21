package com.e106.demolition_king.friend.service;

import com.e106.demolition_king.friend.dto.FriendDto;
import com.e106.demolition_king.friend.dto.FriendRequestDto;
import com.e106.demolition_king.friend.entity.Friend;
import com.e106.demolition_king.friend.repository.FriendRepository;
import com.e106.demolition_king.friend.service.validator.FriendValidator;
import com.e106.demolition_king.friend.sse.SseEmitters;
import com.e106.demolition_king.friend.vo.out.FriendStatusVo;
import com.e106.demolition_king.friend.websocket.FriendRedisService;
import com.e106.demolition_king.friend.websocket.FriendWebSocketService;
import com.e106.demolition_king.friend.websocket.PresenceService;
import com.e106.demolition_king.user.entity.User;
import com.e106.demolition_king.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendServiceImpl implements FriendService {

    private final PresenceService presenceService;
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final FriendValidator friendValidator;
    private final SseEmitters sseEmitters;

    @Override
    @Transactional
    public void sendRoomInvite(String senderUuid, String receiverUuid, String roomName) {
        // 1) 유저 존재 확인
        User sender = userRepository.findByUserUuid(senderUuid)
                .orElseThrow(() -> new RuntimeException("보내는 유저가 존재하지 않습니다."));
        User receiver = userRepository.findByUserUuid(receiverUuid)
                .orElseThrow(() -> new RuntimeException("받는 유저가 존재하지 않습니다."));

        // 2) (선택) 친구 관계 검증이 필요하면 여기에 추가

        // 3) 초대 메시지 생성
        String message = sender.getUserNickname()
                + "님이 [" + roomName + "] 방으로 초대하셨습니다.";

        // 4) SSE 전송
        if (sseEmitters.isOnline(receiverUuid)) {
            sseEmitters.send(receiverUuid, "room-invite", message);
        }
    }


    @Override
    public List<FriendStatusVo> getInvitableFriends(String userUuid) {
        return friendRepository.findAllByUserUserUuidAndStatus(userUuid, "FRIEND").stream()
                .filter(friend -> {
                    String targetUuid = friend.getFriend().getUserUuid();
                    return presenceService.isOnline(targetUuid);
                })
                .map(friend -> {
                    String targetUuid = friend.getFriend().getUserUuid();

                    FriendDto dto = FriendDto.builder()
                            .id(friend.getId())
                            .userUuid(friend.getUser().getUserUuid())
                            .friendUuid(targetUuid)
                            .friendNickname(friend.getFriend().getUserNickname())
                            .createdAt(friend.getCreatedAt())
                            .updatedAt(friend.getUpdatedAt())
                            .build();

                    return FriendStatusVo.fromDto(dto, "online");
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<FriendStatusVo> getPendingRequestList(String myUuid) {
        return friendRepository.findAllByFriendUserUuidAndStatus(myUuid, "PENDING").stream()
                .map(f -> {
                    String requesterUuid = f.getUser().getUserUuid();
                    boolean isOnline = presenceService.isOnline(requesterUuid);
                    String status = isOnline ? "online" : "offline";

                    FriendDto dto = FriendDto.builder()
                            .id(f.getId())
                            .userUuid(requesterUuid)
                            .friendUuid(f.getFriend().getUserUuid())
                            .friendNickname(f.getUser().getUserNickname())  // 요청 보낸 사람
                            .createdAt(f.getCreatedAt())
                            .updatedAt(f.getUpdatedAt())
                            .build();

                    return FriendStatusVo.fromDto(dto, status);
                })
                .collect(Collectors.toList());
    }



    @Override
    public List<FriendStatusVo> getFriendListWithStatus(String userUuid) {
        return friendRepository.findAllByUserUserUuidAndStatus(userUuid,"FRIEND").stream()
                .map(f -> {
                    String friendUuid = f.getFriend().getUserUuid();
                    boolean isOnline = presenceService.isOnline(friendUuid);
                    String status = isOnline ? "online" : "offline";

                    FriendDto dto = FriendDto.builder()
                            .id(f.getId())
                            .userUuid(f.getUser().getUserUuid())
                            .friendUuid(friendUuid)
                            .friendNickname(f.getFriend().getUserNickname())
                            .createdAt(f.getCreatedAt())
                            .updatedAt(f.getUpdatedAt())
                            .build();

                    return FriendStatusVo.fromDto(dto, status);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void sendFriendRequest(String senderUuid, FriendRequestDto requestDto) {
        User sender = userRepository.findByUserUuid(senderUuid)
                .orElseThrow(() -> new RuntimeException("보내는 유저가 존재하지 않습니다."));

        User receiver = userRepository.findByUserUuid(requestDto.getFriendUuid())
                .orElseThrow(() -> new RuntimeException("받는 유저가 존재하지 않습니다."));

        // 검증
        friendValidator.validateFriendRequest(sender, receiver);

        // 친구 요청 저장 (status: PENDING)
        Friend friend = Friend.builder()
                .user(sender)
                .friend(receiver)
                .status("PENDING")
                .build();
        friendRepository.save(friend);

        // SSE 알림 전송
        String receiverUuid = receiver.getUserUuid();
        if (sseEmitters.isOnline(receiverUuid)) {
            String message = sender.getUserNickname() + "님이 친구 요청을 보냈습니다!";
            sseEmitters.send(receiverUuid, "friend-request", message);
        }else {
        }
    }


    @Transactional
    @Override
    public void acceptFriendRequest(String receiverUuid, String requesterUuid) {
        Friend request = friendRepository.findByUser_UserUuidAndFriend_UserUuidAndStatus(
                requesterUuid, receiverUuid, "PENDING"
        ).orElseThrow(() -> new RuntimeException("친구 요청이 존재하지 않습니다."));

        request.setStatus("FRIEND");
        friendRepository.save(request);

        // 필요 시 양방향 관계 추가도 가능
        Friend reverse = Friend.builder()
                .user(request.getFriend())  // 수락자
                .friend(request.getUser())  // 요청자
                .status("FRIEND")
                .build();
        friendRepository.save(reverse);
    }

    @Transactional
    @Override
    public void rejectFriendRequest(String receiverUuid, String requesterUuid) {
        Friend request = friendRepository.findByUser_UserUuidAndFriend_UserUuidAndStatus(
                requesterUuid, receiverUuid, "PENDING"
        ).orElseThrow(() -> new RuntimeException("친구 요청이 존재하지 않습니다."));

        friendRepository.delete(request);
    }

    @Transactional
    @Override
    public void deleteFriend(String userUuid, String friendUuid) {
        // 한쪽 방향
        friendRepository.findByUser_UserUuidAndFriend_UserUuid(userUuid, friendUuid)
                .ifPresent(friendRepository::delete);

        // 반대 방향
        friendRepository.findByUser_UserUuidAndFriend_UserUuid(friendUuid, userUuid)
                .ifPresent(friendRepository::delete);
    }

}
