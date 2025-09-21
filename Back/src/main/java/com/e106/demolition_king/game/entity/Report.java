package com.e106.demolition_king.game.entity;

import com.e106.demolition_king.user.entity.User;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_seq")
    private Integer reportSeq;

    @Column(name = "single_top_building")
    private Integer singleTopBuilding;

    @Column(name = "multi_top_building")
    private Integer multiTopBuilding;

    @Column(name = "play_cnt")
    private Integer playCnt;

    @Column(name = "play_time", precision = 10, scale = 0)
    private BigDecimal playTime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "gold_medal")
    private Integer goldMedal;

    @Column(name = "silver_medal")
    private Integer silverMedal;

    @Column(name = "bronze_medal")
    private Integer bronzeMedal;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_uuid", referencedColumnName = "user_uuid", nullable = false)
    private User user;
}
