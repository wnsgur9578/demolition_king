package com.e106.demolition_king.constructure.vo.out;

import com.e106.demolition_king.constructure.entity.Constructure;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ConstructureResponseVo {
    private Integer constructureSeq;
    private Integer hp;
    private String imageUrl;
    private String name;
    private String tier;

    public static ConstructureResponseVo fromEntity(Constructure entity) {
        return ConstructureResponseVo.builder()
                .constructureSeq(entity.getConstructureSeq())
                .hp(entity.getHp())
                .imageUrl(entity.getImageUrl())
                .name(entity.getName())
                .tier(entity.getTier())
                .build();
    }
}
