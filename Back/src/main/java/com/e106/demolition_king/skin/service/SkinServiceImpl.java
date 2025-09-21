package com.e106.demolition_king.skin.service;

import com.e106.demolition_king.common.base.BaseResponseStatus;
import com.e106.demolition_king.common.exception.BaseException;
import com.e106.demolition_king.constructure.entity.Constructure;
import com.e106.demolition_king.constructure.entity.UserConstructure;
import com.e106.demolition_king.constructure.repository.ConstructureRepository;
import com.e106.demolition_king.constructure.repository.UserConstructureRepository;
import com.e106.demolition_king.constructure.service.ConstructureService;
import com.e106.demolition_king.constructure.vo.out.ConstructureResponseVo;
import com.e106.demolition_king.constructure.vo.out.GetConstructureResponseVo;
import com.e106.demolition_king.game.service.GameService;
import com.e106.demolition_king.skin.entity.PlayerSkin;
import com.e106.demolition_king.skin.entity.PlayerSkinItem;
import com.e106.demolition_king.skin.repository.PlayerSkinItemRepository;
import com.e106.demolition_king.skin.repository.PlayerSkinRepository;
import com.e106.demolition_king.skin.vo.in.SelectSkinRequestVo;
import com.e106.demolition_king.skin.vo.out.SkinInfoResponseVo;
import com.e106.demolition_king.skin.vo.out.getSkinResponseVo;
import com.e106.demolition_king.user.entity.User;
import com.e106.demolition_king.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class SkinServiceImpl implements SkinService {

    private final PlayerSkinRepository playerSkinRepository;
    private final PlayerSkinItemRepository playerSkinItemRepository;
    private final UserRepository userRepository;
    private final GameService gameService;


    @Override
    @Transactional
    public void selectSkin(String userUuid, Integer playerSkinItemSeq) {
        // 1) 사용자의 모든 스킨 조회
        List<PlayerSkin> skins = playerSkinRepository.findAllByUser_UserUuid(userUuid);

        boolean found = false;
        for (PlayerSkin ps : skins) {
            // 2) 선택하려는 스킨인지 확인
            if (ps.getPlayerSkinItemSeq().equals(playerSkinItemSeq)) {
                // 3) 잠겨 있으면 예외 발생
                if (ps.getIsUnlock() == 0) {
                    throw new BaseException(BaseResponseStatus.SKIN_LOCKED);
                }
                // 4) 잠금 해제된 스킨만 선택
                ps.setIsSelect(1);
                found = true;
            }
            // 5) 나머지 중에 이미 선택된 건이 있으면 해제
            else if (ps.getIsSelect() == 1) {
                ps.setIsSelect(0);
            }
        }
        // 6) 목록에 아예 없는 스킨이면 => 잠긴 상태이므로 선택 불가
        if (!found) {
            throw new BaseException(BaseResponseStatus.SKIN_LOCKED);
        }
        // 7) 변경된 엔티티를 한 번에 저장
        playerSkinRepository.saveAll(skins);
    }


    @Override
    public SkinInfoResponseVo getSelectedSkinInfo(String userUuid) {
        return playerSkinRepository.findByUser_UserUuidAndIsSelect(userUuid, 1)
                .flatMap(selectedSkin ->
                        playerSkinItemRepository.findById(selectedSkin.getPlayerSkinItemSeq())
                                .map(item -> new SkinInfoResponseVo(item.getPlayerskinItemSeq(), item.getImage())))
                .orElse(null);
    }

    @Override
    public List<getSkinResponseVo> getUserSkinList(String userUuid) {
        List<PlayerSkin> skins = playerSkinRepository.findAllByUser_UserUuid(userUuid);
        return skins.stream()
                .map(skin -> {
                    PlayerSkinItem item = playerSkinItemRepository
                            .findById(skin.getPlayerSkinItemSeq())
                            .orElse(null);
                    return getSkinResponseVo.from(skin, item);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String unlockPlayerSkin(SelectSkinRequestVo vo) {
        String uuid = vo.getUserUuid();
        Integer seq = vo.getPlayerSkinItemSeq();

        // 이미 언락됐는지 확인
        Optional<PlayerSkin> opt = playerSkinRepository
                .findByUser_UserUuidAndPlayerSkinItemSeq(uuid, seq);

        if (opt.filter(ps -> ps.getIsUnlock() == 1).isPresent()) {
            return "이미 보유 중인 스킨입니다.";
        }

        // 가격 차감
        PlayerSkinItem item = playerSkinItemRepository.findById(seq)
                .orElseThrow(() -> new IllegalArgumentException("스킨 아이템이 없습니다."));
        String payResult = gameService.payGold(uuid, item.getPrice());
        if (!"정상처리 되었습니다.".equals(payResult)) {
            return payResult;
        }

        // 언락 로직
        if (opt.isPresent()) {
            opt.get().setIsUnlock(1);
            // Dirty-Checking으로 UPDATE
        } else {
            // 새로 추가
            User user = userRepository.findByUserUuid(uuid)
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
            PlayerSkin newSkin = PlayerSkin.builder()
                    .user(user)
                    .playerSkinItemSeq(seq)
                    .isSelect(0)
                    .isUnlock(1)
                    .build();
            playerSkinRepository.save(newSkin);
        }

        return "정상처리 되었습니다.";
    }
}
