import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PasswordPage.css';
import loginBack from '../assets/images/login/loginbackf.png';
import { useNavigate } from 'react-router-dom';

export default function PasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // 버튼 아래에 띄울 상태값
  // sendStatus: 'loading' | 'sent' | 'error' | null
  // verifyStatus: 'loading' | 'success' | 'mismatch' | 'error' | null
  const [sendStatus, setSendStatus] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);

  // 인증번호 발송
  const handleSendCode = async () => {
    try {
      setSendStatus('loading');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/v1/user/email/reset/send`, {
        email,
      });
      setSendStatus('sent');
    } catch (error) {
      console.error(error);
      setSendStatus('error');
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      setVerifyStatus('loading');
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/v1/user/email/reset/verify`, {
        email,
        code: authCode,
      });

      if (res.data?.result?.available === true) {
        setIsVerified(true);
        setVerifyStatus('success');
      } else {
        setVerifyStatus('mismatch');
      }
    } catch (error) {
      console.error(error);
      setVerifyStatus('error');
    }
  };

  // 다음 단계 (비밀번호 재설정 화면 이동)
  const handleNext = (e) => {
    e.preventDefault();
    if (!isVerified) {
      // 버튼 아래 문구로만 안내하고 싶다면 여기서 아무 것도 하지 않거나,
      // 별도 상태를 두어 노출해도 됩니다. (지금은 Next 버튼은 항상 활성)
      return;
    }
    navigate('/resetpassword', { state: { email } });
  };

  // 입력 변경 시 상태 초기화 (권장)
  useEffect(() => {
    setSendStatus(null);
    setVerifyStatus(null);
  }, [email]);

  useEffect(() => {
    setVerifyStatus(null);
  }, [authCode]);

  return (
    <div className="changepw-page" style={{ backgroundImage: `url(${loginBack})` }}>
      <div className="changepw-box">
        <form className="changepw-form" onSubmit={handleNext}>
          {/* 이메일 입력 + 인증번호 발송 */}
          <div className="form-row3 with-button">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isVerified}
            />
            <div className="password-check-container">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={!email || isVerified || sendStatus === 'loading'}
            >
              {sendStatus === 'loading' ? '전송 중...' : '인증번호 발송'}
            </button>

            {/* 상태 문구: 버튼 아래 */}
            <div className="status-line">
              {sendStatus === 'sent' && (
                <span style={{ color: 'green' }}>전송 완료</span>
              )}
              {sendStatus === 'error' && (
                <span style={{ color: 'orange' }}>
                  전송 실패
                </span>
              )}
              </div>
            </div>
          </div>

          {/* 인증번호 입력 + 확인 */}
          <div className="form-row3 with-button">
            <label>인증번호</label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              required
              disabled={isVerified}
            />
            <div className="password-check-container">
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={!authCode || isVerified || verifyStatus === 'loading'}
            >
              {verifyStatus === 'loading' ? '확인 중...' : '확인'}
            </button>

            {/* 상태 문구: 버튼 아래 */}
            <div className="status-line">
              {verifyStatus === 'success' && (
                <span style={{ color: 'green' }}>인증 완료</span>
              )}
              {verifyStatus === 'mismatch' && (
                <span style={{ color: 'red' }}>올바르지 않음</span>
              )}
              {verifyStatus === 'error' && (
                <span style={{ color: 'orange' }}>
                  인증 실패
                </span>
              )}
              </div>
            </div>
          </div>

          {/* 다음 버튼 */}
          <div className="form-row3 button-row">
            <button type="submit" className="next-button">
              다음 →
            </button>
            {/* 필요 시 여기에도 안내문을 둘 수 있습니다.
            {!isVerified && (
              <div className="status-line" style={{ marginTop: 8 }}>
                <span style={{ color: '#bbb' }}>이메일 인증을 먼저 완료해 주세요.</span>
              </div>
            )} */}
          </div>
        </form>
      </div>
    </div>
  );
}
