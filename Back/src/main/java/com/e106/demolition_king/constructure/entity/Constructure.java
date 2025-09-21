package com.e106.demolition_king.constructure.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "constructure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Constructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "constructure_seq")
    private Integer constructureSeq;

    @Column(name = "hp", nullable = false)
    private Integer hp;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "rate", nullable = false)
    private BigDecimal rate; // 예: 0.1 → 10%

    @Column(name = "name", nullable = false)
    private String name; // 예: 0.1 → 10%

    @Column(name = "tier", nullable = false)
    private String tier;
}
