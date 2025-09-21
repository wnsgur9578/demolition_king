import React from "react";

function AudioComponent({ track }) {
  React.useEffect(() => {
    track.attach();
    return () => {
      track.detach().forEach((el) => el.remove());
    };
  }, [track]);

  return null; // 오디오만 송출되므로 UI는 필요 없음
}

export default AudioComponent;
