package com.e106.demolition_king.statistics.service;

import com.e106.demolition_king.statistics.vo.out.LeaderboardTop10Vo;
import com.e106.demolition_king.statistics.vo.out.LeaderboardRankVo;

import java.util.List;

public interface LeaderboardService {

    List<LeaderboardTop10Vo> getTop10();

    LeaderboardRankVo getMyRank(String userUuid);
}
