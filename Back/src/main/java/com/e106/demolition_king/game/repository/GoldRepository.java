package com.e106.demolition_king.game.repository;



import com.e106.demolition_king.game.entity.Gold;
import com.e106.demolition_king.game.entity.ReportPerDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoldRepository extends JpaRepository<Gold, Integer> {

    // userUuid로 골드 정보 조회
    Optional<Gold> findByUser_UserUuid(String userUuid);

    // 존재 여부 체크
    boolean existsByUser_UserUuid(String userUuid);
}