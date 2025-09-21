import { useEffect } from "react";
import {
  Assets,
  Texture,
  AnimatedSprite,
  Rectangle,
  BaseTexture,
} from "pixi.js";

function CharacterSprite({ app }) {
  useEffect(() => {
    let anim = null;

    const load = async () => {
      try {
        const imagePath = "/assets/sprites/jab_spritesheet_8frames.png";

        // Assets 로드
        const baseTexture = await Assets.load(imagePath);
        console.log(
          "✅ 이미지 로드 성공:",
          baseTexture.width,
          baseTexture.height
        );

        const frameWidth = baseTexture.width / 4; // 4프레임 기준
        const frameHeight = baseTexture.height;
        const textures = [];

        for (let i = 0; i < 4; i++) {
          const frame = new Rectangle(
            i * frameWidth,
            0,
            frameWidth,
            frameHeight
          );
          textures.push(new Texture(baseTexture, frame));
        }

        anim = new AnimatedSprite(textures);
        anim.animationSpeed = 0.15;
        anim.loop = true;
        anim.play();

        anim.anchor.set(0.5);
        anim.x = app.screen.width / 2;
        anim.y = app.screen.height / 2;

        app.stage.addChild(anim);
      } catch (error) {
        console.error("❌ 이미지 로딩 실패:", error);
      }
    };

    load();

    return () => {
      if (anim) {
        app.stage.removeChild(anim);
        anim.destroy();
      }
    };
  }, [app]);

  return null;
}

export default CharacterSprite;
