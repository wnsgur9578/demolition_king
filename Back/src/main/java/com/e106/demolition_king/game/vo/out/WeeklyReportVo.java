package com.e106.demolition_king.game.vo.out;

import java.math.BigDecimal;

public class WeeklyReportVo {
    private final String playDate;
    private final BigDecimal playTimeDate;
    private final int kcal;

    public WeeklyReportVo(String playDate, BigDecimal playTimeDate, int kcal) {
        this.playDate     = playDate;
        this.playTimeDate = playTimeDate;
        this.kcal         = kcal;
    }

    public String getPlayDate()     { return playDate; }
    public BigDecimal getPlayTimeDate() { return playTimeDate; }
    public int getKcal()            { return kcal; }
}
