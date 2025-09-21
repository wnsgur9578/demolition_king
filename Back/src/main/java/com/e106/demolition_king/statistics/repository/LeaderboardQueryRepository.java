package com.e106.demolition_king.statistics.repository;

import com.e106.demolition_king.game.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LeaderboardQueryRepository extends JpaRepository<Report, Long> {

    @Query("""
        SELECT u.userNickname, r.singleTopBuilding, u.userUuid
        FROM Report r
        JOIN r.user u
        WHERE r.singleTopBuilding IS NOT NULL
        ORDER BY r.singleTopBuilding DESC
    """)
    List<Object[]> findAllRankedBySingleTopBuildingDesc();

}
