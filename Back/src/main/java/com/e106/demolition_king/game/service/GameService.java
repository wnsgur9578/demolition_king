package com.e106.demolition_king.game.service;


import com.e106.demolition_king.game.dto.GoldDto;
import com.e106.demolition_king.game.dto.ReportDto;
import com.e106.demolition_king.game.dto.ReportPerDateRequestDto;
import com.e106.demolition_king.game.vo.out.KcalPerDayResponseVo;
import com.e106.demolition_king.game.vo.out.PatternNumericResponse;
import com.e106.demolition_king.game.vo.out.WeeklyReportVo;
import com.e106.demolition_king.user.dto.SignupRequestDto;
import com.e106.demolition_king.user.vo.in.LoginRequestVo;
import com.e106.demolition_king.user.vo.out.TokenResponseVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;


public interface GameService {
    public List<ReportDto> getUserReport(String uuid);

    public void updateUserReport(ReportDto newData);

    void upsertReport(ReportPerDateRequestDto dto);

    BigDecimal getTodayPlayTimeDate(String userUuid);

    public void updateGold(GoldDto dto);

    public int getGold(String userUuid);

    public String payGold(String userUuid, Integer spendGold);

    List<WeeklyReportVo> getWeeklyReports(String userUuid);

    List<KcalPerDayResponseVo> getKcalData(String userUuid, String start, String end);

    PatternNumericResponse generateNumeric();
}
