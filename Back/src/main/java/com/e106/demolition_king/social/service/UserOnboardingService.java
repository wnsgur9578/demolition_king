package com.e106.demolition_king.social.service;


import com.e106.demolition_king.game.entity.Gold;
import com.e106.demolition_king.game.entity.Report;
import com.e106.demolition_king.skin.entity.PlayerSkin;
import com.e106.demolition_king.user.entity.Profile;
import com.e106.demolition_king.user.entity.User;
import com.e106.demolition_king.user.repository.ProfileRepository;
import jakarta.transaction.Transactional;
import com.e106.demolition_king.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Random;
import java.util.UUID;

@Service
public class UserOnboardingService {

    private final UserRepository userRepository;
    private final Random random = new Random();
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public UserOnboardingService(UserRepository userRepository, ProfileRepository profileRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** User + 기본 리소스(Report/Gold/PlayerSkin) 초기화 저장 */
    @Transactional
    public User createNewUserWithDefaults(String email, String googleSubOrNull, String googleName) {
        Profile defaultprofile = profileRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Default profile (seq=1) not found"));

        String randomEncoded = passwordEncoder.encode(UUID.randomUUID().toString());

        User user = User.builder()
                .userUuid(UUID.randomUUID().toString())
                .userEmail(email)
                .password(randomEncoded)
                .userNickname(generateUniqueNickname(googleName)) // User1234
                .googleSub(googleSubOrNull)             // 구글이면 sub 세팅, 아니면 null
                .profile(defaultprofile)
                .createdAt(Timestamp.from(Instant.now()))
                .updatedAt(Timestamp.from(Instant.now()))
                .build();

        // PlayerSkin 1~11: 1번은 해제+선택, 나머지는 잠금
        for (int i = 1; i <= 13; i++) {
            user.getPlayerSkins().add(
                    PlayerSkin.builder()
                            .user(user)
                            .playerSkinItemSeq(i)
                            .isUnlock(i == 1 ? 1 : 0)
                            .isSelect(i == 1 ? 1 : 0)
                            .build()
            );
        }

        // Gold 0
        user.setGold(Gold.builder()
                .user(user)
                .goldCnt(0)
                .build());

        // Report 0
        user.setReport(Report.builder()
                .user(user)
                .singleTopBuilding(0)
                .multiTopBuilding(0)
                .playCnt(0)
                .playTime(BigDecimal.ZERO)
                .goldMedal(0)
                .silverMedal(0)
                .bronzeMedal(0)
                .build());

        return userRepository.save(user);
    }

    /** 구글 닉네임 + 4자리 숫자 (중복 시 재시도) */
    private String generateUniqueNickname(String baseName) {
        String nickname = baseName;
        int count = 1;
        while (userRepository.existsByUserNickname(nickname)) {
            nickname = baseName + "_" + String.format("%04d", count++);
        }
        return nickname;
    }
}
