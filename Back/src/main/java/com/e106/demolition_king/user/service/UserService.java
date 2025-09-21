package com.e106.demolition_king.user.service;


import com.e106.demolition_king.user.dto.SignupRequestDto;
import com.e106.demolition_king.user.vo.in.ChangePasswordRequestVo;
import com.e106.demolition_king.user.vo.in.LoginRequestVo;
import com.e106.demolition_king.user.vo.in.ResetPasswordRequestVo;
import com.e106.demolition_king.user.vo.out.*;

import java.util.List;

public interface UserService {
    void signup(SignupRequestDto request);
    TokenResponseVo login(LoginRequestVo vo);
    void logout(String userUuid);
    TokenResponseVo tokenRefresh(String refreshToken);

    // 추가
    void withdraw(String userUuid, String rawPassword);

    NicknameCheckResponseVo checkNickname(String nickname);

    void updateNickname(String userUuid, String newNickname);

    UserSearchResponseVo findByNickname(String userNickname);

    PasswordResponseVo resetPassword(ResetPasswordRequestVo req);

    PasswordResponseVo changePassword(String userUuid, ChangePasswordRequestVo vo);

    public GetUserInfoResponseVo getUserByUuid(String userUuid);

    boolean isCurrentPasswordValid(String userUuid, String currentPassword);

    List<ProfileResponseVo> getAllProfiles();

    void updateProfile(String userUuid, Integer profileSeq);

    void offline(String userUuid);

    }

