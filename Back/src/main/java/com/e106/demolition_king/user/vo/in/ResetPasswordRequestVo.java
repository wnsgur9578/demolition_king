package com.e106.demolition_king.user.vo.in;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ResetPasswordRequestVo {
    @Schema(description = "비밀번호를 재설정할 사용자 이메일", example = "user@example.com")
    private String email;

    @Schema(description = "새 비밀번호", example = "NewP@ssw0rd!")
    private String newPassword;

    @Schema(description = "새 비밀번호 확인", example = "NewP@ssw0rd!")
    private String confirmPassword;
}
