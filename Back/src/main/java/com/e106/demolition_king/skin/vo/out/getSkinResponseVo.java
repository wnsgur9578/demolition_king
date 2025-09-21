package com.e106.demolition_king.skin.vo.out;

import com.e106.demolition_king.skin.entity.PlayerSkin;
import com.e106.demolition_king.skin.entity.PlayerSkinItem;
import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class getSkinResponseVo {
    private Integer playerskinSeq;
    private Integer playerSkinItemSeq;
    private Integer isSelect;
    private String image;
    private String name;
    private Integer price;
    private Integer isUnlock;

    public static getSkinResponseVo from(PlayerSkin ps, PlayerSkinItem item) {
        return getSkinResponseVo.builder()
                .playerskinSeq(ps.getPlayerskinSeq())
                .playerSkinItemSeq(ps.getPlayerSkinItemSeq())
                .isSelect(ps.getIsSelect())
                .image(item != null ? item.getImage() : null)
                .name(item != null ? item.getName()  : null)
                .price(item != null ? item.getPrice() : null)
                .isUnlock(ps.getIsUnlock())
                .build();
    }
}