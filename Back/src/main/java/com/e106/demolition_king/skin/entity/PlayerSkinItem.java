package com.e106.demolition_king.skin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "playerskin_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerSkinItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer playerskinItemSeq;

    private String image;

    private String name;

    private Integer price;
}