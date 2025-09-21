package com.e106.demolition_king.skin.entity;

import com.e106.demolition_king.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "playerskin")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerSkin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "playerskin_seq")
    private Integer playerskinSeq;

    private Integer isSelect;

    //private String userUuid;

    @Column(name = "playerskin_item_seq")
    private Integer playerSkinItemSeq;

    private Integer isUnlock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_uuid", referencedColumnName = "user_uuid", nullable = false)
    private User user;
}
