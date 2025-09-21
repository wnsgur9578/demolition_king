package com.e106.demolition_king.constructure.service;

import com.e106.demolition_king.constructure.entity.Constructure;
import com.e106.demolition_king.constructure.entity.UserConstructure;
import com.e106.demolition_king.constructure.repository.ConstructureRepository;
import com.e106.demolition_king.constructure.repository.UserConstructureRepository;
import com.e106.demolition_king.constructure.vo.in.ConstructureByEventInVo;
import com.e106.demolition_king.constructure.vo.out.ConstructureResponseVo;
import com.e106.demolition_king.constructure.vo.out.GetConstructureResponseVo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.ThreadLocalRandom;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Transactional
@Service
@Slf4j
@RequiredArgsConstructor
public class ConstructureServiceImpl implements ConstructureService {

    private final ConstructureRepository constructureRepository;
    private final UserConstructureRepository userConstructureRepository;

    @Override
    public List<ConstructureResponseVo> generateConstructures(int count) {
        if (count <= 0) return Collections.emptyList();

        // 1) 풀 구성: tier = 'event' 제외
        List<Constructure> pool = constructureRepository.findAll().stream()
                .filter(c -> c.getTier() == null || !"event".equalsIgnoreCase(c.getTier()))
                .toList();

        if (pool.isEmpty()) return Collections.emptyList();

        // 2) 가중치 대상만 남기기 (rate > 0)
        List<Constructure> weighted = pool.stream()
                .filter(c -> c.getRate() != null && c.getRate().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        // 3) 전부 0 또는 null이면 균등 랜덤
        if (weighted.isEmpty()) {
            List<ConstructureResponseVo> fallback = new ArrayList<>(count);
            for (int i = 0; i < count; i++) {
                Constructure pick = pool.get(ThreadLocalRandom.current().nextInt(pool.size()));
                fallback.add(ConstructureResponseVo.fromEntity(pick));
            }
            return fallback;
        }

        // 4) 가중치 합
        BigDecimal totalWeight = weighted.stream()
                .map(Constructure::getRate)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5) 가중치 랜덤 선택
        List<ConstructureResponseVo> result = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            BigDecimal r = totalWeight.multiply(BigDecimal.valueOf(ThreadLocalRandom.current().nextDouble()));
            BigDecimal cumulative = BigDecimal.ZERO;

            for (Constructure c : weighted) {
                cumulative = cumulative.add(c.getRate());
                if (r.compareTo(cumulative) < 0) { // < 0로 경계 편향 제거
                    result.add(ConstructureResponseVo.fromEntity(c));
                    break;
                }
            }
        }
        return result;
    }

    public void insertNewConstructures(String userUuid, List<Integer> constructureSeqList) {

        // 1. 해당 유저가 이미 보유한 건물 목록 조회
        List<UserConstructure> existingList = userConstructureRepository.findByUserUuid(userUuid);
        Set<Integer> existingSeqSet = existingList.stream()
                .map(UserConstructure::getConstructureSeq)
                .collect(Collectors.toSet());

        // 2. 새로 받은 리스트에서 이미 보유한 건물 제거
        List<Integer> newConstructures = constructureSeqList.stream()
                .filter(seq -> !existingSeqSet.contains(seq))
                .toList();

        // 3. 중복되지 않은 건물만 insert
        List<UserConstructure> toSave = newConstructures.stream()
                .map(seq -> UserConstructure.builder()
                        .userUuid(userUuid)
                        .constructureSeq(seq)
                        .build())
                .toList();

        userConstructureRepository.saveAll(toSave);
    }

    public List<GetConstructureResponseVo> getUserConstructures(String userUuid) {
        // 1. 보유한 건물 SEQ 조회
        Set<Integer> ownedSeqSet = userConstructureRepository.findByUserUuid(userUuid).stream()
                .map(UserConstructure::getConstructureSeq)
                .collect(Collectors.toSet());


        System.out.println("ownedSeqSet : " + ownedSeqSet);
        // 2. 전체 건물 목록 조회
        List<Constructure> allConstructures = constructureRepository.findAll();

        System.out.println("allConstructures : " + allConstructures);
        // 3. 전체 목록 순회하며 lock 여부 태깅
        return allConstructures.stream()
                .map(constructure -> GetConstructureResponseVo.fromEntityWithOpen(
                        constructure,
                        ownedSeqSet.contains(constructure.getConstructureSeq()) // 보유한 경우만 lock: true
                ))
                .toList();
    }
    @Override
    public ConstructureResponseVo getByEvent(ConstructureByEventInVo inVo) {
        String prefix = inVo.isEventK() ? "eventk" : "eventw";
        String nameKey = prefix + inVo.getId(); // ex) eventk1

        Constructure c = constructureRepository.findByName(nameKey)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND, "건물을 찾을 수 없습니다: " + nameKey));

        return ConstructureResponseVo.builder()
                .constructureSeq(c.getConstructureSeq())
                .name(c.getName())
                .imageUrl(c.getImageUrl())
                .hp(c.getHp())
                .tier(c.getTier())
                .build();
    }
    @Override
    @Transactional
    public List<GetConstructureResponseVo> getUserEventConstructures(String userUuid) {

        // 1) 유저가 보유한 건물 SEQ -> Set
        Set<Integer> ownedSeqSet = userConstructureRepository.findByUserUuid(userUuid).stream()
                .map(UserConstructure::getConstructureSeq)
                .collect(Collectors.toSet());
        // 2) 이벤트 건물 전체 조회
        List<Constructure> targets = constructureRepository.findAllEventConstructures();
        // 3) isOpen 태깅 후 반환
        return targets.stream()
                .map(c -> GetConstructureResponseVo.fromEntityWithOpen(c, ownedSeqSet.contains(c.getConstructureSeq())))
                .toList();
    }

}