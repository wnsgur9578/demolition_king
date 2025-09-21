package com.e106.demolition_king.friend.service.validator;

import com.e106.demolition_king.friend.entity.Friend;
import com.e106.demolition_king.friend.repository.FriendRepository;
import com.e106.demolition_king.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FriendValidator {

    private final FriendRepository friendRepository;

    public void validateFriendRequest(User sender, User receiver) {
        if (sender.getUserUuid().equals(receiver.getUserUuid())) {
            throw new IllegalArgumentException("자기 자신에게 친구 요청을 보낼 수 없습니다.");
        }

        if (friendRepository.existsByUser_UserUuidAndFriend_UserUuidAndStatus(sender.getUserUuid(), receiver.getUserUuid(), "FRIEND") ||
                friendRepository.existsByUser_UserUuidAndFriend_UserUuidAndStatus(receiver.getUserUuid(), sender.getUserUuid(), "FRIEND")) {
            throw new IllegalArgumentException("이미 친구 상태입니다.");
        }

        if (friendRepository.existsByUser_UserUuidAndFriend_UserUuidAndStatus(sender.getUserUuid(), receiver.getUserUuid(), "PENDING")) {
            throw new IllegalArgumentException("이미 친구 요청을 보냈습니다.");
        }
    }
}
