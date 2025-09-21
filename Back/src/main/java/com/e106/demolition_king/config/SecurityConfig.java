package com.e106.demolition_king.config;

import com.e106.demolition_king.social.controller.CustomAuthorizationRequestResolver;
import com.e106.demolition_king.social.controller.OAuth2SuccessHandler;
import com.e106.demolition_king.util.JwtAuthenticationFilter;
import com.e106.demolition_king.util.JwtFilter;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final OAuth2SuccessHandler successHandler;

    private final CustomAuthorizationRequestResolver customAuthorizationRequestResolver;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final JwtFilter jwtFilter;


    @Lazy
    public SecurityConfig(OAuth2SuccessHandler successHandler, CustomAuthorizationRequestResolver customAuthorizationRequestResolver, JwtAuthenticationFilter jwtAuthenticationFilter, JwtFilter jwtFilter) {
        this.successHandler = successHandler;
        this.customAuthorizationRequestResolver = customAuthorizationRequestResolver;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;       // JwtFilter는 이미 빈으로 등록됨
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {         // 비밀번호 암호화 빈
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // 1) CORS 전체 설정 객체 생성
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "*"
//                "http://localhost:5173",                  // 프론트 개발용
//                "http://172.26.14.249:8080",              // Swagger UI 실행 위치
//                "http://54.180.226.214:8080"              // EC2 퍼블릭 IP에서 Swagger UI 실행하는 경우
        ));
//        config.setAllowedOrigins(List.of("http://localhost:5173"));   // 허용할 프론트 주소
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));                       // 모든 요청 헤더 허용
        config.setAllowCredentials(true);                             // 쿠키/인증 헤더 허용

        // 2) URL 패턴별 CORS 설정 매핑
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/api/**", config);          // /api/** 에 위 설정 적용
        source.registerCorsConfiguration("/**", config); // 일단 개발 환경에서 모두 허용
        return source;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())                      // CSRF 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)         // 기본 BasicAuth 비활성화
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(sm ->                           // 세션도 사용 안 함
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // 이 한 줄이면 모든 엔드포인트를 인증 없이 허용합니다
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(a -> a
                                .baseUri("/api/oauth2/authorization")                 // ✅ 시작 URL을 /api로
                                .authorizationRequestResolver(customAuthorizationRequestResolver)
                        )
                        .redirectionEndpoint(r -> r
                                .baseUri("/api/login/oauth2/code/*")                  // ✅ 콜백 URL을 /api로 (중요)
                        )
                        .successHandler(successHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login")
                        .addLogoutHandler((request, response, authentication) -> {
                            HttpSession session = request.getSession();
                            session.invalidate();
                        })
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.sendRedirect("/login"))
                        .deleteCookies("JSESSIONID", "refreshToken")
                );
        return http.build();
    }
    /* 일단 모든 경로 허용해둠
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 스프링 기본 Basic 인증 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth ->
                        auth
                                // 로그인/회원가입 등
                                .requestMatchers("/api/v1/user/signup", "/api/v1/user/login", "/api/v1/user/email/**").permitAll()

                                // Swagger UI & API Docs
                                .requestMatchers(
                                        "/v3/api-docs/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/swagger-resources/**",
                                        "/webjars/**"
                                ).permitAll()

                                // 나머지 요청은 JWT 인증
                                .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    */
}