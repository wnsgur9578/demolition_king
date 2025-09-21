package com.e106.demolition_king.friend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FriendDto {
    /** PK */
    private Integer id;

    /** 친구 관계를 맺은 주체 유저 UUID */
    private String userUuid;

    /** 친구로 등록된 유저 UUID */
    private String friendUuid;

    /** 친구 닉네임 등 추가 정보 */
    private String friendNickname;

    /** 생성 시각 */
    private LocalDateTime createdAt;

    /** 수정 시각 */
    private LocalDateTime updatedAt;
}
