package com.e106.demolition_king.friend.vo.in;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "방 초대 요청 VO")
public record RoomInviteRequestVo(

        @NotBlank
        @Schema(description = "초대할 친구 UUID", example = "f41d8a9e-...")
        String friendUuid,

        @NotBlank
        @Schema(description = "방 정보", example = "복싱연습방-7")
        String roomInfo

) {}
