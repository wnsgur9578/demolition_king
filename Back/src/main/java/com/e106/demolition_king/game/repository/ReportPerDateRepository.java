package com.e106.demolition_king.game.repository;



import com.e106.demolition_king.game.entity.ReportPerDate;
import com.e106.demolition_king.game.vo.out.KcalPerDayResponseVo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportPerDateRepository extends JpaRepository<ReportPerDate, Integer> {

    Optional<ReportPerDate> findByUser_UserUuidAndPlayDate(String userUuid, String playDate);

    List<ReportPerDate> findAllByUser_UserUuidAndPlayDateBetweenOrderByPlayDateAsc(
            String userUuid,
            String startDate,
            String endDate
    );

    @Query("""
        select new com.e106.demolition_king.game.vo.out.KcalPerDayResponseVo(r.playDate, r.kcal)
        from ReportPerDate r
        where r.user.userUuid = :userUuid
          and r.playDate between :start and :end
        order by r.playDate
    """)
    List<KcalPerDayResponseVo> findKcalByUser_UserUuidAndDateRange(
            @Param("userUuid") String userUuid,
            @Param("start") String start,
            @Param("end") String end
    );
}