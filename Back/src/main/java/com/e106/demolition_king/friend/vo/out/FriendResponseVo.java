package com.e106.demolition_king.friend.vo.out;


import com.e106.demolition_king.friend.dto.FriendDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendResponseVo {
    /** 친구 관계 시퀀스 */
    private Integer id;

    /** 본인 UUID */
    private String userUuid;

    /** 친구 UUID */
    private String friendUuid;

    /** 친구 닉네임 */
    private String friendNickname;

    /** 생성 시각 */
    private LocalDateTime createdAt;

    /** 수정 시각 */
    private LocalDateTime updatedAt;

    /**
     * FriendDto -> FriendResponseVo 변환
     */
    public static FriendResponseVo fromDto(FriendDto dto) {
        return FriendResponseVo.builder()
                .id(dto.getId())
                .userUuid(dto.getUserUuid())
                .friendUuid(dto.getFriendUuid())
                .friendNickname(dto.getFriendNickname())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
