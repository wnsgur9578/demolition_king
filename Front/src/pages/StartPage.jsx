import React, { useState, useEffect } from "react";
import "../styles/StartPage.css";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/images/start/logo.png";
import character1 from "../assets/images/start/characterpick.png";
import character2 from "../assets/images/start/charp.png";
import pressStartImage from "../assets/images/start/pressstart.png";
import AnimatedPage from "../components/AnimatedPage";
import { useAudio } from "../context/AudioContext";
import startBgm from "../assets/sounds/start_bgm.wav";
/* ====== 전체화면 권장 프롬프트 ====== */
function FullscreenPrompt() {
  const [open, setOpen] = useState(false);
  const storageKey = "fsNoticeDismissed"; // 다시 보지 않기
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const shortcutText = isMac ? "Control + Command + F" : "F11";

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey) === "1";
    if (!dismissed && !document.fullscreenElement) {
      setOpen(true);
    }

    const onFsChange = () => {
      if (document.fullscreenElement) setOpen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const requestFullscreen = async () => {
    const el = document.documentElement;
    try {
      // 표준 + 벤더 프리픽스 대응
      const fn =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (fn) await fn.call(el);
      setOpen(false);
    } catch (e) {
      console.warn("requestFullscreen 실패:", e);
    }
  };

  const closeToday = () => setOpen(false); // "나중에"
  const neverShow = () => {
    localStorage.setItem(storageKey, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fs-notice-overlay">
      <div className="fs-notice-card">
        <div className="fs-notice-title">크롬 전체화면을 권장해요</div>
        <div className="fs-notice-desc">
          더 좋은 몰입감을 위해 <b>Chrome</b>에서{" "}
          <b>{shortcutText}</b> 키(또는 아래 버튼)를 사용해 <br/>전체화면으로
          플레이해 보세요.<br/>
          화면이 꽉 차도록 크기를 확대해도 좋아요.

        </div>

        <div className="fs-notice-actions">
          <button className="fs-btn primary" onClick={requestFullscreen}>
            전체화면으로 전환
          </button>
          <button className="fs-btn" onClick={closeToday}>
            나중에
          </button>
          <button className="fs-btn ghost" onClick={neverShow}>
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
/* ================================== */

function StartPage() {
  const [currentCharacter, setCurrentCharacter] = useState(character1);
  const navigate = useNavigate();

  const { audioRef, playAudio } = useAudio();  // 오디오 상태 가져오기

  useEffect(() => {
    // 스타트 화면에 오면 오디오를 처음부터 재생
    if (audioRef.current) {
      audioRef.current.currentTime = 0;  // 오디오를 처음부터 설정
      playAudio();  // 음악을 재생
    }

    // 페이지 전환 시 현재 시간을 로컬스토리지에 저장
    const saveAudioTime = () => {
      if (audioRef.current) {
        localStorage.setItem('audioTime', audioRef.current.currentTime);
      }
    };

    // `audioRef.current`가 HTMLAudioElement인 경우에만 addEventListener 사용
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('play', saveAudioTime);
    }

    return () => {
      // clean up
      if (audioElement) {
        audioElement.removeEventListener('play', saveAudioTime);
        localStorage.setItem('audioTime', audioElement.currentTime);
      }
    };
  }, [audioRef, playAudio]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacter((prev) =>
        prev === character1 ? character2 : character1
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    const autoLogin = localStorage.getItem("autoLogin");
    const user = JSON.parse(localStorage.getItem("user"));
    if (autoLogin === "true" && user) {
      navigate("/story");
    } else {
      navigate("/login");
    }
  };

  const characterClass =
    currentCharacter === character2
      ? "start-character punch-style"
      : "start-character";

  return (
    <AnimatedPage>
      {/* 전체화면 권장 알림 */}
      <FullscreenPrompt />

      <div className="start-page-background">
        <div className="start-content">
          <div className="logo-wrapper">
            <img src={logoImage} alt="Logo" className="start-logo" />
          </div>
          <div className="character-wrapper">
            <img
              src={currentCharacter}
              alt="Character"
              className={characterClass}
            />
          </div>
          <div className="button-wrapper">
            <img
              src={pressStartImage}
              alt="Press Start"
              className="start-button"
              onClick={handleStartClick}
            />
          </div>
        </div>
      </div>

      {/* 배경 음악 */}
      <audio ref={audioRef} src={startBgm} loop />
    </AnimatedPage>
  );
}

export default StartPage;
