import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

import building1 from '../../assets/images/building/building1.png';
import singleBack from '../../assets/images/singlemode/singleback.png';
import eventgameback from '../../assets/images/eventmode/eventgameback.png';
import buildingDust1 from '../../assets/images/effects/building_dust_1.png';
import buildingDust2 from '../../assets/images/effects/building_dust_2.png';
import buildingDust3 from '../../assets/images/effects/building_dust_3.png';
import crackTexture from '../../assets/images/effects/punch_effect.png';

// 1 boxer 프레임
import boxer_idle from '../../assets/images/karina/boxer_idle.png';
import boxer_punch_1 from '../../assets/images/karina/boxer_punch_1.png';
import boxer_punch_2 from '../../assets/images/karina/boxer_punch_2.png';
import boxer_upper from '../../assets/images/karina/boxer_upper.png';

// 2 student 프레임
import student_1 from '../../assets/images/karina/student_1.png';    
import student_2 from '../../assets/images/karina/student_2.png';
import student_3 from '../../assets/images/karina/student_3.png'; 
import student_upper from '../../assets/images/karina/student_upper.png';

// 3 police 프레임
import police_1 from '../../assets/images/karina/police_1.png';
import police_2 from '../../assets/images/karina/police_2.png';
import police_3 from '../../assets/images/karina/police_3.png';
import police_upper from '../../assets/images/karina/police_upper.png';

// 4 soldier 프레임
import soldier_1 from '../../assets/images/karina/soldier_1.png'; 
import soldier_2 from '../../assets/images/karina/soldier_2.png'; 
import soldier_3 from '../../assets/images/karina/soldier_3.png'; 
import soldier_upper from '../../assets/images/karina/soldier_upper.png'; 

// 5 teacher 프레임
import teacher_1 from '../../assets/images/karina/teacher_1.png';
import teacher_2 from '../../assets/images/karina/teacher_2.png';
import teacher_3 from '../../assets/images/karina/teacher_3.png';
import teacher_upper from '../../assets/images/karina/teacher_upper.png';

// 6 카리나 프레임
import karina_final_anim_01 from '../../assets/images/karina/karina_final_anim_01.png';
import karina_final_anim_03 from '../../assets/images/karina/karina_final_anim_03.png';
import karina_final_anim_05 from '../../assets/images/karina/karina_final_anim_05.png';
import karina_upper from '../../assets/images/karina/karina_upper.png';

// 7 winter 프레임
import winter_1 from '../../assets/images/karina/winter_1.png';
import winter_2 from '../../assets/images/karina/winter_2.png'; 
import winter_3 from '../../assets/images/karina/winter_3.png'; 
import winter_upper from '../../assets/images/karina/winter_upper.png'; 

// 8 ufc 프레임
import ufc_1 from '../../assets/images/karina/ufc_1.png'; 
import ufc_2 from '../../assets/images/karina/ufc_2.png'; 
import ufc_3 from '../../assets/images/karina/ufc_3.png'; 
import ufc_upper from '../../assets/images/karina/ufc_upper.png'; 

// 9 son 프레임
import son_1 from '../../assets/images/karina/son_1.png';
import son_2 from '../../assets/images/karina/son_2.png';
import son_3 from '../../assets/images/karina/son_3.png';
import son_upper from '../../assets/images/karina/son_upper.png';

// 10 제니 프레임
import jennie_1 from '../../assets/images/karina/jennie_1.png';
import jennie_2 from '../../assets/images/karina/jennie_2.png';
import jennie_3 from '../../assets/images/karina/jennie_3.png';  
import jennie_upper from '../../assets/images/karina/jennie_upper.png';

// 11 리라 프레임
import rira_1 from '../../assets/images/karina/rira_1.png';
import rira_2 from '../../assets/images/karina/rira_2.png';
import rira_3 from '../../assets/images/karina/rira_3.png';
import rira_upper from '../../assets/images/karina/rira_upper.png';

// 12 로니 프레임
import ronnie_01 from '../../assets/images/karina/ronnie_01.png';
import ronnie_02 from '../../assets/images/karina/ronnie_02.png';
import ronnie_03 from '../../assets/images/karina/ronnie_03.png';
import ronnie_upper from '../../assets/images/karina/ronnie_upper.png';
import ronnie_main_1 from '../../assets/images/karina/ronnie_main_1.png';
import ronnie_main_2 from '../../assets/images/karina/ronnie_main_2.png';

// 13 짱구 프레임
import jjang_1 from '../../assets/images/karina/jjang_1.png';
import jjang_2 from '../../assets/images/karina/jjang_2.png';
import jjang_3 from '../../assets/images/karina/jjang_3.png';
import jjang_upper from '../../assets/images/karina/jjang_upper.png';




// 캐릭터 이미지들 (기본 캐릭터들 있을 경우)
//import army from '../../assets/images/character/army.png';
//import jennie from '../../assets/images/character/jennie.png';
import police from '../../assets/images/character/police.png';
//import student from '../../assets/images/character/student.png';
//import son from '../../assets/images/character/son.png';
import worker from '../../assets/images/character/worker.png';
//import winter from '../../assets/images/character/winter.png';
//import ufc from '../../assets/images/character/ufc.png';
import character from '../../assets/images/character/character.png';

const dustFrames = [buildingDust1, buildingDust2, buildingDust3, buildingDust2, buildingDust1];

// ========= 상수 =========
const HP_BAR_WIDTH = 180;
const HP_BAR_HEIGHT = 12;
const HP_BAR_OFFSET_Y = 18;

// 건물 들어갈 고정 박스(비율 유지) — “박스 바닥”에 건물 바닥을 붙임
const BOX_W_RATIO = 0.33;
const BOX_H_RATIO = 0.55;
const BOX_POS_X_RATIO = 0.63;
const BOX_POS_Y_RATIO = 0.63;

const computeBox = (app) => {
  const w = app.renderer.width * BOX_W_RATIO;
  const h = app.renderer.height * BOX_H_RATIO;
  const cx = app.renderer.width * BOX_POS_X_RATIO;
  const cy = app.renderer.height * BOX_POS_Y_RATIO;
  const bottomY = cy + h / 2; // 박스 바닥 라인
  return { w, h, cx, cy, bottomY };
};

const isAlive = (obj) => !!obj && !obj.destroyed;
const safeSetScale = (sprite, s) => {
     if (!isAlive(sprite)) return;
     if (sprite.scale && typeof sprite.scale.set === 'function') {
         sprite.scale.set(s);
       }
   };

// 비율 유지 스케일
const fitSpriteToBox = (sprite, boxW, boxH, mode = 'fit') => {
     if (!isAlive(sprite)) return;
    const doResize = () => {
        if (!isAlive(sprite)) return;
        const tex = sprite.texture;
        if (!tex || !tex.valid) return;
        const texW = tex.width || 1;
        const texH = tex.height || 1;
        const sx = boxW / texW;
        const sy = boxH / texH;
        const s  = mode === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);
        safeSetScale(sprite, s);
      };
    const tex = sprite.texture;
    if (tex && tex.valid) doResize();
    else tex && tex.once && tex.once('update', doResize);
  };

// HP/먼지 위치: anchorY = 1(바닥 기준)
const placeHpAndDust = (buildingSprite, hpBg, hpFill, dust) => {
  if (!isAlive(buildingSprite)) return;
  const topY = buildingSprite.y - buildingSprite.height; // 바닥기준이라 top = y - height
  if (hpBg) {
    hpBg.x = buildingSprite.x - HP_BAR_WIDTH / 2;
    hpBg.y = topY - HP_BAR_OFFSET_Y;
  }
  if (hpFill) {
    hpFill.x = buildingSprite.x - HP_BAR_WIDTH / 2;
    hpFill.y = topY - HP_BAR_OFFSET_Y;
  }
  if (dust) {
    dust.x = buildingSprite.x;
    dust.y = buildingSprite.y - 10; // 건물 바닥 바로 위
  }
};

// 금(크랙) 위치를 건물 내부에 무작위로
const randomCrackPosition = (b) => {
  const topY = b.y - b.height;
  const x = b.x + (Math.random() - 0.5) * b.width * 0.6;
  const y = topY + b.height * (0.15 + Math.random() * 0.7); // 위/아래 여백 조금
  return { x, y };
};

const PixiCanvas = ({
  action,
  hitToken,
  playerSkin,
  onBuildingDestroyed,
  kcal,
  setKcal,
  showBuildingHp,
  building, // { constructureSeq, hp, imageUrl, name }
}) => {
  const pixiRef = useRef(null);
  const appRef = useRef(null);

  const boxerRef = useRef(null);
  const buildingSpriteRef = useRef(null);
  const hpBgRef = useRef(null);
  const healthBarRef = useRef(null);
  const dustSpriteRef = useRef(null);

  // ★ 히트 순간 임팩트 크랙(딱 1장만 사용)
  const impactCrackRef = useRef(null);
  const impactHideTimerRef = useRef(null);
  const impactFadeTickerRef = useRef(null);

  const prevActionRef = useRef('idle');
  const lastHitTokenRef = useRef(0);
  const destroyedLock = useRef(false);

  const [buildingHP, setBuildingHP] = useState(building?.hp ?? 100);
  const maxHPRef = useRef(building?.hp ?? 100);

  const [isBuildingFalling, setIsBuildingFalling] = useState(false);
  const [isNewBuildingDropping, setIsNewBuildingDropping] = useState(false);

  const boxerWidth = 250;
  const boxerHeight = 250;

  // ✅ 변경 1) 선택 캐릭터에 맞춰 교체 가능한 프레임 레퍼런스
  const jabFramesRef = useRef([]);
  const uppercutFramesRef = useRef([]);

  // ========== PIXI 초기화 ==========
  useEffect(() => {
    if (!pixiRef.current) return;

    const app = new PIXI.Application({
      width: pixiRef.current.clientWidth,
      height: pixiRef.current.clientHeight,
      backgroundAlpha: 0,
      resizeTo: pixiRef.current,
    });

    appRef.current = app;
    pixiRef.current.appendChild(app.view);
    app.stage.sortableChildren = true;

    loadAssets();

    const handleResize = () => {
      if (!appRef.current) return;
      const app = appRef.current;
      app.renderer.resize(pixiRef.current.clientWidth, pixiRef.current.clientHeight);

      // 리사이즈 시 하단 정렬 유지
      const b = buildingSpriteRef.current;
      if (b) {
        const { w: boxW, h: boxH, cx, bottomY } = computeBox(app);
        b.x = cx;
        fitSpriteToBox(b, boxW, boxH, 'fit');
        b.y = bottomY; // 바닥 붙임
        placeHpAndDust(b, hpBgRef.current, healthBarRef.current, dustSpriteRef.current);

        // 임팩트 크랙도 중앙 근처로 보정
        if (impactCrackRef.current) {
          impactCrackRef.current.x = b.x;
          impactCrackRef.current.y = b.y - b.height * 0.2;
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // 임팩트 타이머/티커 정리
      if (impactHideTimerRef.current) clearTimeout(impactHideTimerRef.current);
      if (impactFadeTickerRef.current) app.ticker.remove(impactFadeTickerRef.current);
      app.destroy(true, { children: true });
      appRef.current = null;
      boxerRef.current = null;
      buildingSpriteRef.current = null;
      hpBgRef.current = null;
      healthBarRef.current = null;
      dustSpriteRef.current = null;
      impactCrackRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeAddChild = (sprite) => {
    const app = appRef.current;
    if (app?.stage && !app.stage.destroyed) {
      app.stage.addChild(sprite);
    }
  };

  const loadAssets = () => {
    const app = appRef.current;
    if (!app) return;
    const { cx, cy, w: boxW, h: boxH, bottomY } = computeBox(app);

    // 배경
    const background = PIXI.Sprite.from(eventgameback);
    background.anchor.set(0.5);
    background.x = app.renderer.width / 2;
    background.y = app.renderer.height / 2;
    background.zIndex = 0;
    background.width = app.renderer.width;
    background.height = app.renderer.height;
    safeAddChild(background);

    // ✅ 변경 2) 선택한 캐릭터 프레임을 ref에 주입
    const selectedCharacter = localStorage.getItem('selectedCharacter');       // 이미지 URL
    const selectedCharacterNum = localStorage.getItem('selectedCharacternum'); // ex) "6"
    let boxerImage;

    if (selectedCharacterNum === '6') { // 카리나
      jabFramesRef.current = [
        karina_final_anim_01,
        karina_final_anim_03,
        karina_final_anim_05,
        karina_final_anim_05,
        karina_final_anim_03,
        karina_final_anim_01,
      ];
      uppercutFramesRef.current = [
        karina_final_anim_01,
        karina_final_anim_03,
        karina_upper,
        karina_upper,
        karina_final_anim_03,
        karina_final_anim_01,
      ];
      boxerImage = karina_final_anim_01;
    } else if (selectedCharacterNum === '1') { // 예: 복서
      jabFramesRef.current = [boxer_idle, boxer_punch_1, boxer_punch_2, boxer_punch_2, boxer_punch_1, boxer_idle];
      uppercutFramesRef.current = [boxer_idle, boxer_punch_1, boxer_upper, boxer_upper, boxer_punch_1, boxer_idle];
      boxerImage = boxer_idle;

    } else if (selectedCharacterNum === '2') {  // student
      jabFramesRef.current = [student_1, student_2, student_3, student_3, student_2, student_1];  
      uppercutFramesRef.current = [student_1, student_2, student_upper, student_upper, student_2, student_1]; 
      boxerImage = student_1;

    } else if (selectedCharacterNum === '3') { // police
      jabFramesRef.current = [police_1, police_2, police_3, police_3, police_2, police_1];
      uppercutFramesRef.current = [police_1, police_2, police_upper, police_upper, police_2, police_1];
      boxerImage = police_1;

    } else if (selectedCharacterNum === '4') { // soldier
      jabFramesRef.current = [soldier_1, soldier_2, soldier_3, soldier_3, soldier_2, soldier_1];
      uppercutFramesRef.current = [soldier_1, soldier_2, soldier_upper, soldier_upper, soldier_2, soldier_1];
      boxerImage = soldier_1;
    } else if (selectedCharacterNum === '5') { // teacher 
      jabFramesRef.current = [teacher_1, teacher_2, teacher_3, teacher_3, teacher_2, teacher_1];  
      uppercutFramesRef.current = [teacher_1, teacher_2, teacher_upper, teacher_upper, teacher_2, teacher_1]; 
      boxerImage = teacher_1; 

    } else if (selectedCharacterNum === '7') { // winter
      jabFramesRef.current = [winter_1, winter_2, winter_3, winter_3, winter_2, winter_1];  
      uppercutFramesRef.current = [winter_1, winter_2, winter_upper, winter_upper, winter_2, winter_1];
      boxerImage = winter_1;
    } else if (selectedCharacterNum === '8') { // ufc
      jabFramesRef.current = [ufc_1, ufc_2, ufc_3, ufc_3, ufc_2, ufc_1];
      uppercutFramesRef.current = [ufc_1, ufc_2, ufc_upper, ufc_upper, ufc_2, ufc_1]; 
      boxerImage = ufc_1;
    } else if (selectedCharacterNum === '9') { // son
      jabFramesRef.current = [son_1, son_2, son_3, son_3, son_2, son_1];      
      uppercutFramesRef.current = [son_1, son_2, son_upper, son_upper, son_2, son_1]; 
      boxerImage = son_1;
    } else if (selectedCharacterNum === '10') { // jennie
      jabFramesRef.current = [jennie_1, jennie_2, jennie_3, jennie_3, jennie_2, jennie_1];  
      uppercutFramesRef.current = [jennie_1, jennie_2, jennie_upper, jennie_upper, jennie_2, jennie_1]; 
      boxerImage = jennie_1;
    } else if (selectedCharacterNum === '11') { // 리라 
      jabFramesRef.current = [rira_1, rira_2, rira_3, rira_3, rira_2, rira_1];  
      uppercutFramesRef.current = [rira_1, rira_2, rira_upper, rira_upper, rira_2, rira_1]; 
      boxerImage = rira_1;
    } else if (selectedCharacterNum === '12') { // 예: 로니
      jabFramesRef.current = [ronnie_01, ronnie_02, ronnie_03, ronnie_03, ronnie_02, ronnie_01];
      uppercutFramesRef.current = [ronnie_01, ronnie_02, ronnie_upper, ronnie_upper, ronnie_02, ronnie_01];
      boxerImage = ronnie_01;
    } else if (selectedCharacterNum === '13') { // 짱구
      jabFramesRef.current = [jjang_1, jjang_2, jjang_3, jjang_3, jjang_2, jjang_1];
      uppercutFramesRef.current = [jjang_1, jjang_2, jjang_upper, jjang_upper, jjang_2, jjang_1];
      boxerImage = jjang_1;
    } else {
      // 그 외 캐릭터는 정지 이미지(선택 이미지)로 프레임 구성
      const idle = selectedCharacter || boxer_idle;
      jabFramesRef.current = [idle, idle, idle, idle, idle, idle];
      uppercutFramesRef.current = [idle, idle, idle, idle, idle, idle];
      boxerImage = idle;
    }

    // ✅ 변경 3) 복서 스프라이트 “한 번만” 추가 (중복 제거)
    const boxer = new PIXI.Sprite(PIXI.Texture.from(boxerImage));
    boxer.anchor.set(0.5);
    boxer.width = boxerWidth;
    boxer.height = boxerHeight;
    boxer.x = app.renderer.width * 0.3;
    boxer.y = app.renderer.height * 0.75;
    boxer.zIndex = 1;
    boxerRef.current = boxer;
    safeAddChild(boxer);

    // 건물 (바닥 기준 정렬)
    const bld = new PIXI.Sprite(PIXI.Texture.from(building?.imageUrl || building1));
    bld.anchor.set(0.5, 1); // ⬅️ 바닥 기준
    bld.x = cx;
    fitSpriteToBox(bld, boxW, boxH, 'fit');
    bld.y = bottomY; // ⬅️ 박스 바닥에 붙임
    bld.zIndex = 1;
    buildingSpriteRef.current = bld;
    safeAddChild(bld);

    // 먼지 (바닥 근처)
    const dust = new PIXI.Sprite(PIXI.Texture.from(dustFrames[0]));
    dust.anchor.set(0.5);
    dust.visible = false;
    dust.zIndex = 2;
    dustSpriteRef.current = dust;
    safeAddChild(dust);

    // HP 바
    if (showBuildingHp) {
      const hpBg = new PIXI.Graphics();
      hpBg.beginFill(0xaaaaaa).drawRect(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT).endFill();
      hpBg.zIndex = 3;
      hpBgRef.current = hpBg;
      safeAddChild(hpBg);

      const hpFill = new PIXI.Graphics();
      hpFill.beginFill(0xff3333).drawRect(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT).endFill();
      hpFill.zIndex = 4;
      healthBarRef.current = hpFill;
      safeAddChild(hpFill);
    } else {
      hpBgRef.current = null;
      healthBarRef.current = null;
    }

    placeHpAndDust(bld, hpBgRef.current, healthBarRef.current, dustSpriteRef.current);

    // ★ 임팩트 크랙 1장 (히트 순간만 잠깐 보였다 사라짐)
    const impact = new PIXI.Sprite(PIXI.Texture.from(crackTexture));
    impact.alpha = 0.9;
    impact.anchor.set(0.5);
    impact.scale.set(0.5);
    impact.visible = false;
    impact.zIndex = 4;
    impact.x = bld.x;
    impact.y = bld.y - bld.height * 0.2;
    impactCrackRef.current = impact;
    safeAddChild(impact);
  };

  // ========= building 변경 시 (텍스처/HP/정렬 갱신) =========
  useEffect(() => {
    const app = appRef.current;
    const b = buildingSpriteRef.current;
    if (!app || !b || !building) return;

    maxHPRef.current = building.hp ?? 100;
    setBuildingHP(maxHPRef.current);

    b.texture = PIXI.Texture.from(building.imageUrl || building1);

    const { w: boxW, h: boxH, cx, bottomY } = computeBox(app);
    b.anchor.set(0.5, 1);
    b.x = cx;
    fitSpriteToBox(b, boxW, boxH, 'fit');
    b.y = bottomY;

    if (impactCrackRef.current) {
      impactCrackRef.current.x = b.x;
      impactCrackRef.current.y = b.y - b.height * 0.2;
      impactCrackRef.current.visible = false;
      impactCrackRef.current.alpha = 0.9;
    }

    placeHpAndDust(b, hpBgRef.current, healthBarRef.current, dustSpriteRef.current);
  }, [building]);

  // ★ 타격 순간 임팩트 크랙 표시/사라짐 — 중첩 방지, 200ms만 노출
  const showCrackOnce = (duration = 200, fadeOut = false) => {
       const app = appRef.current;
       const b = buildingSpriteRef.current;
       const crack = impactCrackRef.current;
       if (!app || !isAlive(b) || !isAlive(crack)) return;

    // 이전 예약/티커 정리
    if (impactHideTimerRef.current) {
      clearTimeout(impactHideTimerRef.current);
      impactHideTimerRef.current = null;
    }
    if (impactFadeTickerRef.current) {
      app.ticker.remove(impactFadeTickerRef.current);
      impactFadeTickerRef.current = null;
    }

    // 랜덤 위치 재설정
    const p = randomCrackPosition(b);
    crack.x = p.x;
    crack.y = p.y;
    crack.alpha = 0.9;
    crack.visible = true;

    if (!fadeOut) {
      impactHideTimerRef.current = setTimeout(() => {
        if (impactCrackRef.current) impactCrackRef.current.visible = false;
        impactHideTimerRef.current = null;
      }, duration);
    } else {
      // (옵션) 페이드 아웃
      let elapsed = 0;
      const total = duration;
      const ticker = (delta) => {
        elapsed += (1000 / 60) * delta;
        const t = Math.min(elapsed / total, 1);
        crack.alpha = 0.9 * (1 - t);
        if (t >= 1) {
          crack.visible = false;
          app.ticker.remove(ticker);
          impactFadeTickerRef.current = null;
        }
      };
      impactFadeTickerRef.current = ticker;
      app.ticker.add(ticker);
    }
  };

  // ========= 펀치 / 어퍼컷 =========
  useEffect(() => {
    if (!boxerRef.current) return;

    const isJab   = action === 'punch' || (typeof action === 'string' && action.endsWith('_jab'));
    const isUpper = action === 'uppercut' || (typeof action === 'string' && action.endsWith('_uppercut'));

    if ((isJab || isUpper) &&
        prevActionRef.current !== action &&
        !isBuildingFalling &&
        !isNewBuildingDropping) {

      const frames = isUpper ? uppercutFramesRef.current : jabFramesRef.current;

      let i = 0;
      const interval = setInterval(() => {
        if (i < frames.length && boxerRef.current) {
          boxerRef.current.texture = PIXI.Texture.from(frames[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 80);
    }

    prevActionRef.current = action;
  }, [action, isNewBuildingDropping, isBuildingFalling]);


  // 콤보가 실제로 소모되었을 때만 데미지 적용
  useEffect(() => {
    if (hitToken == null) return;
    if (hitToken === lastHitTokenRef.current) return;
    if (!appRef.current || !isAlive(buildingSpriteRef.current)) return;

    lastHitTokenRef.current = hitToken;

    // 데미지/칼로리
    setBuildingHP(prev => Math.max(prev - 20, 0));
    if (typeof setKcal === 'function') {
      setKcal(prev => Math.round((prev + 0.1) * 10) / 10);
    }

    // 임팩트 크랙
    showCrackOnce(200, false);
  }, [hitToken, setKcal]);



  // ========= HP 변화 =========
  useEffect(() => {
    if (healthBarRef.current) {
      const pct = Math.max(0, Math.min(1, buildingHP / (maxHPRef.current || 100)));
      const newWidth = pct * HP_BAR_WIDTH;
      healthBarRef.current.clear();
      healthBarRef.current.beginFill(0xff3333).drawRect(0, 0, newWidth, HP_BAR_HEIGHT).endFill();
      placeHpAndDust(buildingSpriteRef.current, hpBgRef.current, healthBarRef.current, dustSpriteRef.current);
    }

    if (buildingHP <= 0 && !isBuildingFalling) {
      setIsBuildingFalling(true);
    }
  }, [buildingHP]);

  // ========= 붕괴 → 먼지 =========
  useEffect(() => {
    const app = appRef.current;
    const b = buildingSpriteRef.current;
    const dust = dustSpriteRef.current;
    if (!b || !dust) return;

    // 붕괴 시작되면 임팩트 크랙 정리
    if (isBuildingFalling) {
      if (impactHideTimerRef.current) { clearTimeout(impactHideTimerRef.current); impactHideTimerRef.current = null; }
      if (impactFadeTickerRef.current) { app?.ticker.remove(impactFadeTickerRef.current); impactFadeTickerRef.current = null; }
      if (impactCrackRef.current) impactCrackRef.current.visible = false;
    }

    let frameIndex = 0;
    let interval;

    if (isBuildingFalling) {
      dust.visible = true;
      b.visible = false;

      interval = setInterval(() => {
        if (frameIndex < dustFrames.length) {
          dust.texture = PIXI.Texture.from(dustFrames[frameIndex]);
          frameIndex++;
        } else {
          clearInterval(interval);
          dust.visible = false;
          setIsBuildingFalling(false);
          setIsNewBuildingDropping(true);

          if (!destroyedLock.current) {
            destroyedLock.current = true;
            onBuildingDestroyed?.(building?.constructureSeq);
          }
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBuildingFalling, building, onBuildingDestroyed]);

  // ========= 새 건물 드랍 (바닥 정렬) =========
  useEffect(() => {
    const app = appRef.current;
    const b = buildingSpriteRef.current;
    if (!app || !b) return;

    if (isNewBuildingDropping && building) {
      const { w: boxW, h: boxH, cx, bottomY } = computeBox(app);

      // 임팩트 크랙 안전정리
      if (impactHideTimerRef.current) { clearTimeout(impactHideTimerRef.current); impactHideTimerRef.current = null; }
      if (impactFadeTickerRef.current) { app.ticker.remove(impactFadeTickerRef.current); impactFadeTickerRef.current = null; }
      if (impactCrackRef.current) impactCrackRef.current.visible = false;

      b.anchor.set(0.5, 1);
      b.x = cx;
      b.y = -50; // 화면 위에서 시작
      b.texture = PIXI.Texture.from(building.imageUrl || building1);
      b.visible = true;

      maxHPRef.current = building.hp ?? 100;
      setBuildingHP(maxHPRef.current);

      fitSpriteToBox(b, boxW, boxH, 'fit');
      placeHpAndDust(b, hpBgRef.current, healthBarRef.current, dustSpriteRef.current);

      const ticker = (delta) => {
        b.y += 15 * delta;
        if (b.y >= bottomY) {
          b.y = bottomY;
          setIsNewBuildingDropping(false);
          destroyedLock.current = false;
          app.ticker.remove(ticker);
          placeHpAndDust(b, hpBgRef.current, healthBarRef.current, dustSpriteRef.current);
        }
      };
      app.ticker.add(ticker);
    }
  }, [isNewBuildingDropping, building]);

  return (
    <div
      ref={pixiRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
};

export default PixiCanvas;
