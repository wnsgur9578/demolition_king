package com.e106.demolition_king.user.dto;

import com.e106.demolition_king.user.entity.Profile;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {
    private Integer profileSeq;
    private String image;

    public static ProfileDto from(Profile profile) {
        if (profile == null) return null;
        return ProfileDto.builder()
                .profileSeq(profile.getProfileSeq())
                .image(profile.getImage())
                .build();
    }
}
