package com.e106.demolition_king.skin.repository;

import com.e106.demolition_king.skin.entity.PlayerSkin;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerSkinRepository extends JpaRepository<PlayerSkin, Integer> {

//    // 해당 유저의 선택된 스킨 조회
//    Optional<PlayerSkin> findByUserUuidAndIsSelect(String userUuid, int isSelect);
//
//    // 해당 유저 + 스킨 키로 조회
//    Optional<PlayerSkin> findByUserUuidAndPlayerSkinItemSeq(String userUuid, Integer playerSkinItemSeq);
//
//    List<PlayerSkin> findAllByUserUuid(String userUuid);
//
//    Optional<PlayerSkin> findByUserUuidAndPlayerSkinItemSeqAndIsUnlock(String userUuid, Integer playerSkinItemSeq, Integer isUnlock);
    // 선택된 스킨 조회
    Optional<PlayerSkin> findByUser_UserUuidAndIsSelect(String userUuid, Integer isSelect);

    // 특정 스킨 조회
    Optional<PlayerSkin> findByUser_UserUuidAndPlayerSkinItemSeq(String userUuid, Integer playerSkinItemSeq);

    // 유저의 모든 스킨 조회
    List<PlayerSkin> findAllByUser_UserUuid(String userUuid);

    // 언락된 특정 스킨 조회
    Optional<PlayerSkin> findByUser_UserUuidAndPlayerSkinItemSeqAndIsUnlock(String userUuid, Integer playerSkinItemSeq, Integer isUnlock);



//    @Query("SELECT ps.playerSkinItem.image FROM PlayerSkin ps WHERE ps.userUuid = :userUuid AND ps.isSelect = 1")
//    String findSelectedImageByUserUuid(@Param("userUuid") String userUuid);
}
