import React, { createContext, useState, useRef, useContext, useEffect } from 'react';

// 오디오 컨텍스트 생성
const AudioContext = createContext();

// 오디오 컨텍스트 제공자 컴포넌트
export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 오디오 재생 함수
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  // 오디오 정지 함수
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <AudioContext.Provider value={{ audioRef, isPlaying, playAudio, stopAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

// 오디오 컨텍스트를 사용하는 커스텀 훅
export const useAudio = () => useContext(AudioContext);
