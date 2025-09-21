import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/ResetPasswordPage.css';
import loginBack from '../assets/images/login/loginbackf.png';

export default function ResetPasswordPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || ''; // 없으면 직접 입력받게 해도 됨

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!email) return setErr('이메일 정보가 없습니다. 처음 단계부터 진행해 주세요.');
    if (pw !== pw2) return setErr('비밀번호가 일치하지 않습니다.');

    setLoading(true);
    try {
      await api.post('/user/auth/password/reset', {
        email,
        newPassword: pw,
        confirmPassword: pw2,
      });
      // alert('비밀번호가 변경되었습니다!');
      navigate('/login'); // 원하는 경로로 변경
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changepw-page" style={{ backgroundImage: `url(${loginBack})` }}>
      <div className="changepw-box">
        <form className="changepw-form" onSubmit={handleSubmit}>

          <div className="form-row4">
            <label>새 비밀번호</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required placeholder="영문, 숫자 포함 8~20자, 공백 불가"/>
          </div>

          <div className="form-row4">
            <label>비밀번호 확인</label>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          </div>

          {err && <div className="error-text">{err}</div>}

          <div className="form-row4 button-row">
            <button type="submit" className="next-button" disabled={loading}>
              {loading ? '처리 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
