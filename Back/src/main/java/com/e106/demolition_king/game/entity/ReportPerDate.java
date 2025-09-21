package com.e106.demolition_king.game.entity;

import com.e106.demolition_king.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_per_date")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportPerDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportDateSeq;

    private String playDate; // yyyyMMdd

    private Integer kcal;

    private BigDecimal playTimeDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void update(int additionalKcal, BigDecimal additionalPlayTime) {
        this.kcal += additionalKcal;
        this.playTimeDate = this.playTimeDate.add(additionalPlayTime);
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_uuid", referencedColumnName = "user_uuid", nullable = false)
    private User user;

}