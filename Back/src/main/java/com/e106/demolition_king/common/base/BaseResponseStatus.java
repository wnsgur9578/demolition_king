package com.e106.demolition_king.common.base;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

// https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
// following http status code standard from above

@Getter
@AllArgsConstructor
public enum BaseResponseStatus {

    /**
     * 2XX: Success(성공)
     **/
    SUCCESS(HttpStatus.OK, true, 200, "요청에 성공하였습니다."),

    /**
     * 4XX: Client Error(클라이언트 에러)
     */
    DISALLOWED_ACTION(HttpStatus.BAD_REQUEST, false, 400, "올바르지 않은 행위 요청입니다."),
    WRONG_JWT_TOKEN(HttpStatus.UNAUTHORIZED, false, 401, "다시 로그인 해주세요"),
    NO_SIGN_IN(HttpStatus.UNAUTHORIZED, false, 401, "로그인을 먼저 진행해주세요"),
    NO_ACCESS_AUTHORITY(HttpStatus.FORBIDDEN, false, 403, "접근 권한이 없습니다"),

    /**
     * 5XX: Server Error(서버 에러)
     */
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 500, "Internal server error"),
    SSE_SEND_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, false, 503, "알림 전송에 실패하였습니다."),
    REDIS_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 500, "Internal Cache system failure"),
    MAIL_SEND_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 500, "Mail system failure"),

    /**
     * Service Related Errors
     */

    // token
    TOKEN_NOT_VALID(HttpStatus.UNAUTHORIZED, false, 403, "토큰이 유효하지 않습니다."),
    INVALID_AUTH_HEADER(HttpStatus.UNAUTHORIZED, false, 403, "헤더가 유효하지 않습니다."),
    // Users
    DUPLICATED_USER(HttpStatus.CONFLICT, false, 409, "이미 가입된 멤버입니다."),
    FAILED_TO_LOGIN(HttpStatus.UNAUTHORIZED, false, 400, "아이디 또는 패스워드를 다시 확인하세요."),
    DUPLICATED_SOCIAL_USER(HttpStatus.CONFLICT, false, 409, "이미 소셜 연동된 계정입니다."),
    DUPLICATED_SOCIAL_PROVIDER_USER(HttpStatus.CONFLICT, false, 409, "계정에 동일한 플랫폼이 이미 연동되어있습니다"),
    NO_EXIST_USER(HttpStatus.NOT_FOUND, false, 404, "존재하지 않는 멤버 정보입니다."),
    PASSWORD_MATCH_FAILED(HttpStatus.BAD_REQUEST, false, 400, "패스워드를 다시 확인해주세요."),
    NO_SUPPORTED_PROVIDER(HttpStatus.BAD_REQUEST, false, 400, "지원하지 않는 플랫폼입니다"),
    DUPLICATED_NICKNAME(HttpStatus.CONFLICT, false, 409, "이미 사용중인 닉네임입니다."),
    SAME_NICKNAME(HttpStatus.CONFLICT, false, 409, "현재 사용중인 닉네임입니다."),
    INVALID_EMAIL_ADDRESS(HttpStatus.BAD_REQUEST, false, 400, "이메일을 다시 확인해주세요."),
    CANNOT_FIND_PROFILE(HttpStatus.BAD_REQUEST, false, 400, "프로필을 찾을 수 없습니다."),

    // Email
    EMAIL_SEND_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, false, 502, "이메일 전송에 실패하였습니다."),
    EMAIL_RECIEVE_SUCCESS(HttpStatus.OK, true, 200, "이메일 인증에 성공하셨습니다."),
    EMAIL_RECIEVE_FAIL(HttpStatus.UNAUTHORIZED, false, 400, "시간 만료 또는 이메일 인증에 성공하지 못했습니다."),

    // Notification
    NO_EXIST_NOTIFICATION_SETTING(HttpStatus.NOT_FOUND, false, 404, "유저의 알림 설정이 존재하지 않습니다."),
    EXIST_NOTIFICATION_SETTING(HttpStatus.BAD_REQUEST, false, 409, "유저의 알림 설정이 이미 존재합니다."),
    NO_EXIST_NOTIFICATION(HttpStatus.NOT_FOUND, false, 410, "존재하지 않는 알림입니다."),
    CANNOT_SHARE(HttpStatus.BAD_REQUEST, false, 451, "공유할 수 없는 유저입니다."),

    // 여기에 친구 관련 상태 추가
    FRIEND_REQUEST_SENT(HttpStatus.OK, true, 200, "친구 요청을 전송했습니다."),
    FRIEND_REQUEST_ALREADY_SENT(HttpStatus.BAD_REQUEST, false, 400, "이미 친구 요청을 보냈습니다."),
    FRIEND_ALREADY_EXISTS(HttpStatus.CONFLICT, false, 409, "이미 친구 상태입니다."),
    FRIEND_REQUEST_ACCEPTED(HttpStatus.OK, true, 200, "친구 요청을 수락했습니다."),
    FRIEND_REQUEST_REJECTED(HttpStatus.OK, true, 200, "친구 요청을 거절했습니다."),
    FRIEND_REMOVED(HttpStatus.OK, true, 200, "친구를 삭제했습니다."),
    FRIEND_NOT_FOUND(HttpStatus.NOT_FOUND, false, 404, "해당 친구 관계를 찾을 수 없습니다."),
    FRIEND_ONLINE(HttpStatus.OK, true, 200, "친구가 온라인입니다."),
    FRIEND_OFFLINE(HttpStatus.OK, true, 200, "친구가 오프라인입니다."),
    FRIEND_STATUS_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 500, "친구 온라인 상태를 조회하는 도중 오류가 발생했습니다."),

    //스킨 관련 상태
    SKIN_LOCKED(HttpStatus.BAD_REQUEST, false, 400, "스킨이 해금되지 않았습니다.");


    private final HttpStatusCode httpStatusCode;
    private final boolean isSuccess;
    private final int code;
    private final String message;

}