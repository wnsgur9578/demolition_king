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
public class FriendStatusVo {
    private Integer id;
    private String userUuid;
    private String friendUuid;
    private String friendNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;

    /**
     * FriendDto → FriendStatusVo 변환
     */
    public static FriendStatusVo fromDto(FriendDto dto, String status) {
        return FriendStatusVo.builder()
                .id(dto.getId())
                .userUuid(dto.getUserUuid())
                .friendUuid(dto.getFriendUuid())
                .friendNickname(dto.getFriendNickname())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .status(status)
                .build();
    }
}
