package com.e106.demolition_king.social.controller;

import com.e106.demolition_king.social.service.UserOnboardingService;
import com.e106.demolition_king.user.entity.User;
import com.e106.demolition_king.user.repository.UserRepository;
import com.e106.demolition_king.user.service.UserServiceImpl;
import com.e106.demolition_king.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.data.redis.core.RedisTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserOnboardingService onboardingService;
    private final UserServiceImpl userService;
    private final RedisTemplate<String, String> redisTemplate;

    public OAuth2SuccessHandler(JwtUtil jwtUtil,
                                UserRepository userRepository,
                                UserOnboardingService onboardingService,
                                UserServiceImpl userService,
                                RedisTemplate<String, String> redisTemplate) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.onboardingService = onboardingService;
        this.userService = userService;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) {

        // 어떤 프로바이더인지 식별 (google | kakao 등)
        String registrationId = null;
        if (authentication instanceof OAuth2AuthenticationToken token) {
            registrationId = token.getAuthorizedClientRegistrationId();
        }

        // 공통 추출
        String email = null;
        String name  = null;
        String googleSub = null;
        String kakaoId   = null;

        // ===== 구글(OIDC) =====
        if ("google".equalsIgnoreCase(registrationId) && authentication.getPrincipal() instanceof OidcUser oidcUser) {
            Map<String, Object> attrs = oidcUser.getAttributes();
            email     = (String) attrs.get("email");
            googleSub = (String) attrs.get("sub");
            name      = (String) Optional.ofNullable(attrs.get("name")).orElse(email);

            // 탈퇴 의도/최근 재인증 체크
            boolean intentDelete = isDeleteIntent(request);
            boolean recentAuth   = isRecentAuth(oidcUser, 120);
            if (intentDelete) {
                handleDeleteFlow(response, email, /*mustRecent*/true, recentAuth);
                return;
            }

            // 일반 로그인 진행
            proceedNormalLogin(response, email, String.valueOf(name), googleSub, null);
            return;
        }

        // ===== 카카오(OAuth2) =====
        if ("kakao".equalsIgnoreCase(registrationId) && authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            Map<String, Object> attrs = oAuth2User.getAttributes();
            // 최상위 id
            Object idObj = attrs.get("id");
            kakaoId = (idObj != null ? String.valueOf(idObj) : null);

            // kakao_account 내부에서 email / profile.nickname
            Map<String, Object> kakaoAccount = castMap(attrs.get("kakao_account"));
            if (kakaoAccount != null) {
                email = (String) kakaoAccount.get("email");
                Map<String, Object> profile = castMap(kakaoAccount.get("profile"));
                if (profile != null) {
                    Object nick = profile.get("nickname");
                    name = nick != null ? nick.toString() : null;
                }
            }
            if (name == null) name = email;

            boolean intentDelete = isDeleteIntent(request);
            if (intentDelete) {
                // 카카오는 OIDC 기본이 아니라 auth_time이 없음 → 리졸버에서 prompt=login으로 재로그인 유도했다고 가정하고 통과
                handleDeleteFlow(response, email, /*mustRecent*/false, /*recentAuth*/true);
                return;
            }

            proceedNormalLogin(response, email, String.valueOf(name), null, kakaoId);
            return;
        }

        // ===== 그 외(예방) =====
        safeRedirect(response, "https://i13e106.p.ssafy.io/login?error=unsupported");
    }

    // ===========================
    // 유틸/공통 로직
    // ===========================

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }

    /**
     * CustomAuthorizationRequestResolver에서
     *  - state="delete" 혹은 "delete:<originalState>"
     *  - 세션 플래그 "OAUTH2_INTENT"=="DELETE"
     * 를 세팅했다고 가정하고 감지한다.
     */
    private boolean isDeleteIntent(HttpServletRequest request) {
        String state = request.getParameter("state");
        HttpSession session = request.getSession(false);
        return ("delete".equals(state) || (state != null && state.startsWith("delete:")))
                || (session != null && "DELETE".equals(session.getAttribute("OAUTH2_INTENT")));
    }

    /**
     * 구글 OIDC의 최근 재인증 확인 (auth_time 또는 issuedAt 기준)
     */
    private boolean isRecentAuth(OidcUser oidcUser, int seconds) {
        Instant now = Instant.now();
        Object claim = oidcUser.getIdToken().getClaim("auth_time");
        Instant authTime;
        if (claim instanceof Number n) {
            authTime = Instant.ofEpochSecond(n.longValue());
        } else {
            authTime = oidcUser.getIdToken().getIssuedAt();
        }
        return (authTime != null) && (now.getEpochSecond() - authTime.getEpochSecond() <= seconds);
    }

    /**
     * 탈퇴 플로우: mustRecent=true면 recentAuth가 true여야 통과
     */
    private void handleDeleteFlow(HttpServletResponse response, String email, boolean mustRecent, boolean recentAuth) {
        try {
            if (mustRecent && !recentAuth) {
                safeRedirect(response, "https://i13e106.p.ssafy.io/login?error=reauth_required");
                return;
            }

            // 삭제 전에 uuid 확보(토큰/레디스 정리를 위해)
            String userUuid = null;
            User before = userRepository.findByUserEmail(email).orElse(null);
            if (before != null) {
                userUuid = before.getUserUuid();
            }

            // 실제 삭제
            userService.deleteByEmail(email);

            // 토큰/레디스/쿠키 정리 (있으면)
            if (userUuid != null) {
                try {
                    redisTemplate.delete("RT:" + userUuid);
                    redisTemplate.delete("online:" + userUuid);
                } catch (Exception ignore) {}
            }
            // 쿠키 삭제
            response.addHeader("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None");

            // 요청대로 탈퇴 후 /login 으로
            safeRedirect(response, "https://i13e106.p.ssafy.io/login");
        } catch (Exception e) {
            safeRedirect(response, "https://i13e106.p.ssafy.io/login?error=server");
        }
    }

    /**
     * 일반 로그인 성공 처리: upsert → 토큰 발급 → 쿠키/레디스 → 프론트로 리다이렉트
     */
    private void proceedNormalLogin(HttpServletResponse response,
                                    String email,
                                    String displayName,
                                    String googleSubOrNull,
                                    String kakaoIdOrNull) {
        // upsert (초기 생성은 기존 온보딩 사용: (email, googleSub, googleName))
        User user = userRepository.findByUserEmail(email)
                .orElseGet(() -> onboardingService.createNewUserWithDefaults(email, googleSubOrNull, displayName));

        // 구글 sub 세팅
        if (googleSubOrNull != null && user.getGoogleSub() == null) {
            user.setGoogleSub(googleSubOrNull);
            user.setUpdatedAt(Timestamp.from(Instant.now()));
            userRepository.save(user);
        }
        // 카카오 id 세팅 (User 엔티티에 kakaoId 필드가 있다고 가정)
        if (kakaoIdOrNull != null) {
            if (user.getKakaoId() == null) {
                user.setKakaoId(kakaoIdOrNull);
                user.setUpdatedAt(Timestamp.from(Instant.now()));
                userRepository.save(user);
            }
        }

        // 토큰 발급 + 저장
        String access  = jwtUtil.createAccessToken(user.getUserUuid(), List.of("USER"));
        String refresh = jwtUtil.createRefreshToken(user.getUserUuid());

        redisTemplate.opsForValue().set("RT:" + user.getUserUuid(), refresh, 31, TimeUnit.DAYS);
        redisTemplate.opsForValue().set("online:" + user.getUserUuid(), "true", 1, TimeUnit.DAYS);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true).secure(true).sameSite("None").path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        response.addHeader("Set-Cookie", refreshCookie.toString());

        // 프론트로 리다이렉트 (story 화면에 access 토큰 전달)
        safeRedirect(response, "https://i13e106.p.ssafy.io/story#access=" + urlEnc(access));
    }

    private String urlEnc(String s) {
        try { return URLEncoder.encode(s, StandardCharsets.UTF_8); }
        catch (Exception e) { return s; }
    }

    private void safeRedirect(HttpServletResponse response, String url) {
        try { response.sendRedirect(url); } catch (Exception ignore) {}
    }
}
