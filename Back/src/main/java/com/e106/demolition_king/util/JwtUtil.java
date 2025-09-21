package com.e106.demolition_king.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

/**
 * JWT 토큰 생성 및 파싱 유틸리티 클래스
 * 순환 참조 방지를 위해 UserDetailsService는 주입하지 않고 외부에서 UserDetails를 받아 처리
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private final long accessTokenExpiration = 1000L * 60 * 60; // 1시간
    private final long refreshTokenExpiration = 1000L * 60 * 60 * 24 * 7; // 7일

    // 사용 연휴된 키 및 해석 가능한 키 생성
    private Key getSigningKey() {
        // BASE64URL 디코더로 바꿔주면 '-'나 '_' 섞여 있어도 OK
        byte[] keyBytes = Decoders.BASE64URL.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // AccessToken 발급
    public String createAccessToken(String userId, List<String> roles) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // RefreshToken 발급
    public String createRefreshToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT 검증을 통해 Claims 구현
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // JWT 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Header에서 "Authorization" 키 통해 Bearer Token 값과 매칭
    public String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return (bearer != null && bearer.startsWith("Bearer ")) ? bearer.substring(7) : null;
    }

    // UserDetails가 지금은 빨리 검색되어 있는 것을 가지고 있다고 가정\uud558고 Authentication 객체 생성
    public Authentication getAuthentication(String token, UserDetails userDetails) {
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }


    public String getUserUuid(String token) {
        return parseClaims(token).getSubject();
    }
}