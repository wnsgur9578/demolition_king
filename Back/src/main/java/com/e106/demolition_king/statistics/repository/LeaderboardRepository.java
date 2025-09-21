package com.e106.demolition_king.statistics.repository;

import com.e106.demolition_king.statistics.vo.out.LeaderboardTop10Vo;
import com.e106.demolition_king.statistics.vo.out.LeaderboardRankVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class LeaderboardRepository {

    private final LeaderboardQueryRepository leaderboardQueryRepository;

    public List<LeaderboardTop10Vo> findTop10BySingleTopBuilding() {
        List<Object[]> results = leaderboardQueryRepository.findAllRankedBySingleTopBuildingDesc();

        int currentRank = 0;
        int previousScore = -1;
        int actualRank = 0;

        List<LeaderboardTop10Vo> top10 = new ArrayList<>();
        for (Object[] row : results) {
            String nickname = (String) row[0];
            int score = (int) row[1];

            actualRank++;
            if (score != previousScore) {
                currentRank = actualRank;
                previousScore = score;
            }

            if (top10.size() < 10) {
                top10.add(new LeaderboardTop10Vo(currentRank, nickname, score));
            } else {
                break;
            }
        }

        return top10;
    }

    public LeaderboardRankVo findMyRankByUserUuid(String userUuid) {
        List<Object[]> results = leaderboardQueryRepository.findAllRankedBySingleTopBuildingDesc();

        int currentRank = 0;
        int previousScore = -1;
        int actualRank = 0;

        for (Object[] row : results) {
            String nickname = (String) row[0];
            int score = (int) row[1];
            String uuid = (String) row[2];

            actualRank++;
            if (score != previousScore) {
                currentRank = actualRank;
                previousScore = score;
            }

            if (uuid.equals(userUuid)) {
                return new LeaderboardRankVo(currentRank, nickname, score);
            }
        }

        return new LeaderboardRankVo(0, "정보 없음", 0);
    }
}
