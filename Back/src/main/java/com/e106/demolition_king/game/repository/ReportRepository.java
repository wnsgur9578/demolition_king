package com.e106.demolition_king.game.repository;


import com.e106.demolition_king.game.dto.ReportDto;
import com.e106.demolition_king.game.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT new com.e106.demolition_king.game.dto.ReportDto(" +
            "r.reportSeq, r.user.userUuid, r.singleTopBuilding, r.multiTopBuilding, " +
            "r.goldMedal, r.silverMedal, r.bronzeMedal, r.createdAt, r.playCnt, r.playTime) " +
            "FROM Report r WHERE r.user.userUuid = :userUuid")
    List<ReportDto> findReportDtoByUserUuid(@Param("userUuid") String userUuid);

    Optional<Report> findByUser_UserUuid(String userUuid);
}
