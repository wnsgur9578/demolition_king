import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import React from 'react';

const PixiGame = forwardRef((props, ref) => {
  const pixiContainer = useRef(null);
  const appRef = useRef(null);
  const characterRef = useRef(null);
  const buildingRef = useRef(null);

  useImperativeHandle(ref, () => ({
    punch() {
      if (!characterRef.current) return;

      // 펀치 애니메이션 (앞으로 갔다가 돌아옴)
      gsap.to(characterRef.current, {
        x: characterRef.current.x + 50,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      });
    },

    destroyBuilding() {
    const building = buildingRef.current;
    if (!building) return;

    // 흔들기 + 축소 + 사라지기
    gsap.to(building, {
      rotation: 0.1,
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        gsap.to(building, {
          scale: 0,
          alpha: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      },
    });
  },
  }));

  useEffect(() => {
    const app = new PIXI.Application({
      width: 640,
      height: 480,
      backgroundAlpha: 0,
    });

    pixiContainer.current.appendChild(app.view);
    appRef.current = app;

    const character = PIXI.Sprite.from('/assets/images/character/character.png');
    character.x = 100;
    character.y = 300;
    character.anchor.set(0.5);
    character.scale.set(0.5);
    app.stage.addChild(character);
    characterRef.current = character;

    const building = PIXI.Sprite.from('/assets/building/building1.png');
building.x = 400;
building.y = 280;
building.anchor.set(0.5);
building.scale.set(0.5);
app.stage.addChild(building);
buildingRef.current = building;


    return () => app.destroy(true, true);
  }, []);

  return <div ref={pixiContainer} />;
});

export default PixiGame;
