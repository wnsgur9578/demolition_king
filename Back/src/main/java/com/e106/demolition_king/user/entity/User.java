package com.e106.demolition_king.user.entity;

import com.e106.demolition_king.game.entity.Gold;
import com.e106.demolition_king.game.entity.Report;
import com.e106.demolition_king.game.entity.ReportPerDate;
import com.e106.demolition_king.skin.entity.PlayerSkin;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    @Id
    @Column(name = "user_uuid", length = 36, nullable = false)
    private String userUuid;

    @Column(length = 50, unique = true, nullable = false)
    private String userEmail;

    @Column(name = "password", length = 100)
    private String password;
    @Column(name = "user_nickname", length = 50, unique = true)
    private String userNickname;
    @Column(name = "kakao_access_token", length = 500, unique = true)
    private String kakaoId;
    @Column(name = "google_access", length = 500, unique = true)
    private String googleSub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_seq")
    private Profile profile;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public String getUsername() {
        return userEmail;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch=FetchType.LAZY)
    private Gold gold;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlayerSkin> playerSkins = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Report report;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportPerDate> reportPerDates = new ArrayList<>();
}
