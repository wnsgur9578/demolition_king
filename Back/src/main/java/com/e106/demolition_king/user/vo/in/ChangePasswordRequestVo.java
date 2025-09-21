package com.e106.demolition_king.user.vo.in;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequestVo {
    private String newPassword;
    private String confirmPassword;
}
