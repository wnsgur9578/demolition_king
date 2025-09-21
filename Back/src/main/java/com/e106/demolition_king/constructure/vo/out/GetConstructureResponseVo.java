package com.e106.demolition_king.constructure.vo.out;

import com.e106.demolition_king.constructure.entity.Constructure;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetConstructureResponseVo {
    private Integer constructureSeq;
    private Integer hp;
    private String imageUrl;
    private boolean isOpen;

    public static GetConstructureResponseVo fromEntity(Constructure entity) {
        return GetConstructureResponseVo.builder()
                .constructureSeq(entity.getConstructureSeq())
                .hp(entity.getHp())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    // 🔥 유저가 보유한지 여부를 입력받아 생성하는 메서드
    public static GetConstructureResponseVo fromEntityWithOpen(Constructure entity, boolean isOpen) {
        return GetConstructureResponseVo.builder()
                .constructureSeq(entity.getConstructureSeq())
                .hp(entity.getHp())
                .imageUrl(entity.getImageUrl())
                .isOpen(isOpen)
                .build();
    }

}
