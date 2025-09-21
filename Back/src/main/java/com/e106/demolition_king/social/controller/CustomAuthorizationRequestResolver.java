package com.e106.demolition_king.social.controller;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.Map;

@Component

public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver delegate;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo) {
        // 기본 엔드포인트: /oauth2/authorization/{registrationId}
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(repo, "/api/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = delegate.resolve(request);
        return customize(request, req);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId) {
        OAuth2AuthorizationRequest req = delegate.resolve(request, registrationId);
        return customize(request, req);
    }

    private OAuth2AuthorizationRequest customize(HttpServletRequest request, OAuth2AuthorizationRequest req) {
        if (req == null) return null;

        // URL 쿼리 파라미터 읽기
        MultiValueMap<String, String> params = UriComponentsBuilder.fromUriString(request.getRequestURI() +
                        (request.getQueryString() != null ? "?" + request.getQueryString() : ""))
                .build().getQueryParams();

        boolean isDelete = "delete".equalsIgnoreCase(params.getFirst("purpose"));

        if (!isDelete) return req;

        // delete 모드면 prompt/max_age/state 지정
        Map<String, Object> add = new LinkedHashMap<>(req.getAdditionalParameters());
        add.put("prompt", "login");
//        add.put("max_age", "120");

        return OAuth2AuthorizationRequest.from(req)
                .state("delete")
                .additionalParameters(add)
                .build();
    }
}