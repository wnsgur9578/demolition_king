import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api'; // ✅ axios 인스턴스 기반
import '../styles/LoginPage.css';
import googleIcon from '../assets/images/login/google.png';
import kakaoIcon from '../assets/images/login/kakao.png';
import loginBack from '../assets/images/login/loginbackf.png';
import backIcon from '../assets/images/back.png';
import AnimatedPage from '../components/AnimatedPage';
import { useAudio } from "../context/AudioContext"; // AudioContext import
import startBgm from "../assets/sounds/start_bgm.wav";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('❌ JWT 파싱 실패:', e);
    return null;
  }
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // 'loading' | 'error' | null
  const [loginError, setLoginError] = useState('');     // 에러 메시지

  const navigate = useNavigate();
  const { audioRef, playAudio } = useAudio();

  useEffect(() => {
    if (audioRef.current) {
      const savedTime = localStorage.getItem('audioTime');
      const parsedTime = parseFloat(savedTime);
      audioRef.current.currentTime = (!isNaN(parsedTime) && isFinite(parsedTime)) ? parsedTime : 0;
      playAudio();
    }
    const saveAudioTime = () => {
      if (audioRef.current) {
        localStorage.setItem('audioTime', audioRef.current.currentTime);
      }
    };
    const audioElement = audioRef.current;
    if (audioElement) audioElement.addEventListener('play', saveAudioTime);
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('play', saveAudioTime);
        localStorage.setItem('audioTime', audioElement.currentTime);
      }
    };
  }, [audioRef, playAudio]);

  useEffect(() => {
    if (loginStatus === 'error') {
      setLoginStatus(null);
      setLoginError('');
    }
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginStatus('loading');

      const response = await api.post('/user/auth/login', null, {
        params: { email, password },
      });

      const result = response?.data?.result;
      const accessToken = result?.accessToken;
      const refreshToken = result?.refreshToken;

      const decoded = parseJwt(accessToken);
      const userUuid = decoded?.sub || decoded?.userUuid || decoded?.id;

      if (!userUuid) {
        setLoginStatus('error');
        setLoginError('userUuid를 토큰에서 추출하지 못했습니다.');
        return;
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userUuid', userUuid);
      localStorage.setItem('userEmail', email);

      const userInfo = await api.get(`/user/auth/getUserInfo?userUuid=${userUuid}`);
      const nickname = userInfo.data.result.userNickname;

      localStorage.setItem('userNickname', nickname);
      localStorage.setItem('user', JSON.stringify(userInfo.data.result));

      navigate('/story');
    } catch (error) {
      const message = error.response?.data?.message || '아이디 또는 비밀번호가 잘못되었습니다.';
      setLoginStatus('error');
      setLoginError(`❌ 로그인 실패: ${message}`);
    }
  };

  return (
    <AnimatedPage>
      <div
        className="login-page-background"
        style={{ backgroundImage: `url(${loginBack})` }}
      >
        <div className="login-box">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-row1 with-button">
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* 이메일 */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ width: '100px' }}>이메일</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* 비밀번호 */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px' }}>비밀번호</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loginStatus === 'loading'}>
                {loginStatus === 'loading' ? '로그인 중...' : '로그인'}
              </button>
            </div>
            {/* 상태 문구: 비밀번호 입력 아래 */}
                {loginStatus === 'error' && (
                  <div className="status-line-under-password">
                    <span>{loginError}</span>
                  </div>
                )}

            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />{' '}
                자동로그인
              </label>
            </div>

            <div className="social-login">
              <img
                src={googleIcon}
                alt="Google"
                onClick={() => {
                  window.location.href = "/api/oauth2/authorization/google";
                }}
              />
              <img
                src={kakaoIcon}
                alt="Kakao"
                onClick={() => {
                  window.location.href = "/api/oauth2/authorization/kakao";
                }}
              />
            </div>

            <div className="login-links">
              <Link to="/signup">회원가입</Link> | <Link to="/password">비밀번호 찾기</Link>
            </div>
          </form>
        </div>
      </div>
      {/* 배경 음악 */}
      <audio ref={audioRef} src={startBgm} loop />
    </AnimatedPage>
  );
}

export default LoginPage;
