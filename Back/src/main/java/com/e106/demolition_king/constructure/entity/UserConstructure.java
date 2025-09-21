package com.e106.demolition_king.constructure.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_constructure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserConstructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userConstructureSeq;

    private String userUuid;

    private Integer constructureSeq;
}
