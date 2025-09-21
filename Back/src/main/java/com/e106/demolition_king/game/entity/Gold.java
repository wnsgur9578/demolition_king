package com.e106.demolition_king.game.entity;

import com.e106.demolition_king.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "gold")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gold_seq")
    private Integer goldSeq;

    @Column(name = "gold_cnt")
    private Integer goldCnt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_uuid", referencedColumnName = "user_uuid", nullable = false)
    private User user;
}