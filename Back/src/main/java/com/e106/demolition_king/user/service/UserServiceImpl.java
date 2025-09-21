package com.e106.demolition_king.user.service;

import com.e106.demolition_king.common.base.BaseResponseStatus;
import com.e106.demolition_king.common.exception.BaseException;
import com.e106.demolition_king.constructure.repository.UserConstructureRepository;
import com.e106.demolition_king.friend.repository.FriendRepository;
import com.e106.demolition_king.game.entity.Gold;
import com.e106.demolition_king.game.entity.Report;
import com.e106.demolition_king.skin.entity.PlayerSkin;
import com.e106.demolition_king.user.dto.ProfileDto;
import com.e106.demolition_king.user.dto.SignupRequestDto;
import com.e106.demolition_king.user.entity.Profile;
import com.e106.demolition_king.user.entity.User;
import com.e106.demolition_king.user.repository.ProfileRepository;
import com.e106.demolition_king.user.repository.UserRepository;
import com.e106.demolition_king.user.vo.in.ChangePasswordRequestVo;
import com.e106.demolition_king.user.vo.in.LoginRequestVo;
import com.e106.demolition_king.user.vo.in.ResetPasswordRequestVo;
import com.e106.demolition_king.user.vo.out.*;
import com.e106.demolition_king.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {
    private final UserRepository userRepository;         // JPA 레포지토리
    private final ProfileRepository profileRepository;
    private final FriendRepository friendRepository;
    private final UserConstructureRepository userConstructureRepository;
    private final PasswordEncoder passwordEncoder;       // SecurityConfig에서 주입된 BCrypt 인코더
    private final JwtUtil jwtUtil;                       // 토큰 생성·검증 유틸
    private final RedisTemplate<String, String> redisTemplate; // 토큰 저장요 레디스 템플릿


    /**
     * 회원가입 처리
     */
    @Override
    @Transactional
    public void signup(SignupRequestDto dto) {
        Profile profile = profileRepository.findById(dto.getProfileSeq())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CANNOT_FIND_PROFILE));
        // ✂️ UUID 생성
        User user = User.builder()
                .userUuid(UUID.randomUUID().toString())
                .userEmail(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .userNickname(dto.getUserNickname())
                .profile(profile)
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .updatedAt(new Timestamp(System.currentTimeMillis()))
                .build();
        // 2) PlayerSkin 초기화 (1번 선택, 나머지 2~13 잠금/비선택)
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
        // 3) Gold 초기화 (0골드)
        user.setGold(
                Gold.builder()
                        .user(user)
                        .goldCnt(0)
                        .build()
        );
        // 4) Report 초기화 (모든 값 0)
        user.setReport(
                Report.builder()
                        .user(user)
                        .singleTopBuilding(0)
                        .multiTopBuilding(0)
                        .playCnt(0)
                        .playTime(BigDecimal.ZERO)
                        .goldMedal(0)
                        .silverMedal(0)
                        .bronzeMedal(0)
                        .build()
        );
        userRepository.save(user);
    }

    @Override
    public NicknameCheckResponseVo checkNickname(String nickname) {
        boolean exists = userRepository.existsByUserNickname(nickname);
        if (exists) {
            return NicknameCheckResponseVo.builder()
                    .available(false)
                    .message("이미 사용 중인 닉네임입니다.")
                    .build();
        } else {
            return NicknameCheckResponseVo.builder()
                    .available(true)
                    .message("사용 가능한 닉네임입니다.")
                    .build();
        }
    }
    @Override
    @Transactional
    public void updateNickname(String userUuid, String newNickname) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
        user.setUserNickname(newNickname);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSearchResponseVo findByNickname(String userNickname) {
        User user = userRepository.findByUserNickname(userNickname)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
        return new UserSearchResponseVo(
                user.getUserUuid(),
                user.getUserNickname()
        );
    }

    @Override
    public boolean isCurrentPasswordValid(String userUuid, String currentPassword) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
        return passwordEncoder.matches(currentPassword, user.getPassword());
    }

    @Override
    public PasswordResponseVo resetPassword(ResetPasswordRequestVo req) {
        // 1) 비밀번호/확인 일치 여부
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            return PasswordResponseVo.builder()
                    .available(false)
                    .message("새 비밀번호와 확인이 일치하지 않습니다.")
                    .build();
        }
        // 2) 이메일로 사용자 조회
        User user = userRepository.findByUserEmail(req.getEmail())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.INVALID_EMAIL_ADDRESS));
        // 3) 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return PasswordResponseVo.builder()
                .available(true)
                .message("비밀번호가 성공적으로 변경되었습니다.")
                .build();
    }

    @Override
    @Transactional
    public PasswordResponseVo changePassword(String userUuid, ChangePasswordRequestVo vo) {
        // 1) 새 비밀번호/확인 일치 여부
        if (!vo.getNewPassword().equals(vo.getConfirmPassword())) {
            return PasswordResponseVo.builder()
                    .available(false)
                    .message("새 비밀번호와 확인이 일치하지 않습니다.")
                    .build();
        }
        // 2) 사용자 조회
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
        // 3) 새 비밀번호로 변경
        user.setPassword(passwordEncoder.encode(vo.getNewPassword()));

        return PasswordResponseVo.builder()
                .available(true)
                .message("비밀번호가 성공적으로 변경되었습니다.")
                .build();
    }



    /**
     * 로그인 처리: 이메일/비밀번호 검증 후 Access & Refresh 토큰 발급
     */
    @Override
    @Transactional(readOnly = true)
    public TokenResponseVo login(LoginRequestVo vo) {
        User user = userRepository.findByUserEmail(vo.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (!passwordEncoder.matches(vo.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }
        // 권한은 USER 하나만 부여
        String accessToken  = jwtUtil.createAccessToken(user.getUserUuid(), List.of("USER"));
        String refreshToken = jwtUtil.createRefreshToken(user.getUserUuid());

        // Redis에 Refresh Token 저장 (7일 유효)
        redisTemplate.opsForValue().set(
                "RT:" + user.getUserUuid(), refreshToken, 31, TimeUnit.DAYS
        );
        //온라인 유저 redis에 추가
        redisTemplate.opsForValue().set(
                "online:"+ user.getUserUuid(), "true", 1, TimeUnit.DAYS
        );
        return TokenResponseVo.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
    @Override
    @Transactional
    public void logout(String userUuid) {
        // 1) Refresh Token 삭제
        redisTemplate.delete("RT:" + userUuid);
        // 2) 온라인 상태 플래그 삭제
        redisTemplate.delete("online:" + userUuid);
    }

    /**
     * Spring Security 인증용: JWT 필터에서 호출됩니다.
     * 여기서는 userUuid를 username으로 사용합니다.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String userUuid) throws UsernameNotFoundException {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        // Spring Security 표준 UserDetails 객체 생성
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUserUuid())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }

    public TokenResponseVo tokenRefresh(String refreshToken) {
        // 1. 리프레시 토큰 유효성 검증
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
        }
        // 2. 해당 리프레시 토큰이 DB 또는 Redis에 저장된 것과 일치하는지 검증
        // 2. 토큰에서 사용자 UUID 추출
        String userUuid = jwtUtil.getUserUuid(refreshToken);

        // 3. Redis에서 저장된 리프레시 토큰 가져오기
        String savedToken = redisTemplate.opsForValue().get("RT:" + userUuid);
        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new RuntimeException("일치하지 않는 리프레시 토큰입니다.");
        }

        // 4. 새로운 토큰 생성
        String newAccessToken  = jwtUtil.createAccessToken(userUuid, List.of("USER"));
        String newRefreshToken = jwtUtil.createRefreshToken(userUuid);

        // 5. Redis에 새로운 리프레시 토큰 갱신 저장
        redisTemplate.opsForValue().set("RT:" + userUuid, newRefreshToken, 7, TimeUnit.DAYS);

        // 3. Access + Refresh 토큰 재발급
        return TokenResponseVo.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    @Transactional
    public void withdraw(String userUuid, String rawPassword) {
        // 1) 유저 조회x
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        // 2) 비밀번호 확인
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }
        // 3) 탈퇴 처리: 실제 삭제 or isDeleted 플래그
        friendRepository.deleteAllByUserUuidInvolved(userUuid);
        userConstructureRepository.deleteByUserUuid(userUuid);
        userRepository.delete(user);
        // 4) 로그아웃 처리: 남아 있는 RefreshToken 삭제
        redisTemplate.delete("RT:" + userUuid);
    }

    @Transactional(readOnly = true)
    public GetUserInfoResponseVo getUserByUuid(String userUuid) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return GetUserInfoResponseVo.builder()
                .userUuid(user.getUserUuid())
                .userEmail(user.getUserEmail())
                .password(user.getPassword())
                .userNickname(user.getUserNickname())
                .kakaoId(user.getKakaoId())
                .googleSub(user.getGoogleSub())
                .profile(ProfileDto.from(user.getProfile()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    public List<ProfileResponseVo> getAllProfiles() {
        return profileRepository.findAllByOrderByProfileSeqAsc()
                .stream()
                .map(p -> new ProfileResponseVo(p.getProfileSeq(), p.getImage()))
                .toList();
    }

    @Override
    @Transactional
    public void updateProfile(String userUuid, Integer profileSeq){
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
        // 2) Profile 로드
        Profile profile = profileRepository.findById(profileSeq)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CANNOT_FIND_PROFILE));
        // 3) User 에 프로필 설정
        user.setProfile(profile);
    }

    @Transactional
    public void deleteByEmail(String email) {
        userRepository.findByUserEmail(email).ifPresent(userRepository::delete);
    }

    // 오프라인
    @Override
    public void offline(String userUuid) {
        redisTemplate.delete("RT:" + userUuid);
    }
}
