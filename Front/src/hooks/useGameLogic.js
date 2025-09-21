import { useState } from "react"; // ← 이거 추가

const useGameLogic = () => {
  const [buildings, setBuildings] = useState([]); // [] 안에 ... 쓰면 에러남
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState(0);
  const [cloudOffset, setCloudOffset] = useState(0);
  const [notes, setNotes] = useState([]);

  const attack = (motionType) => {
    const matchedNote = checkHitNote(motionType); // checkHitNote가 정의되어야 함
    if (matchedNote) {
      reduceBuildingHP(motionType); // 이것도 정의되어야 함
    }
  };

  return { buildings, cloudOffset, notes, attack };
};

export default useGameLogic;
