package com.e106.demolition_king.statistics.service;

import com.e106.demolition_king.statistics.repository.LeaderboardRepository;
import com.e106.demolition_king.statistics.vo.out.LeaderboardTop10Vo;
import com.e106.demolition_king.statistics.vo.out.LeaderboardRankVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;

    @Override
    public List<LeaderboardTop10Vo> getTop10() {
        return leaderboardRepository.findTop10BySingleTopBuilding();
    }

    @Override
    public LeaderboardRankVo getMyRank(String userUuid) {
        return leaderboardRepository.findMyRankByUserUuid(userUuid);
    }
}
