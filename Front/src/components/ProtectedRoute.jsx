// components/ProtectedRoute.jsx
import React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const at = localStorage.getItem('accessToken');
      if (at) {
        setOk(true); setChecking(false);
        return;
      }
      // ❗ accessToken 없으면 1회 refresh 시도
      try {
        // 쿠키형이면 body 없이, LS형이면 body로
        const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/user/auth/tokenrefresh`, {
          refreshToken: localStorage.getItem('refreshToken') // 쿠키 쓰면 이 줄은 제거
        });
        const newAt = res.data?.result?.accessToken;
        if (newAt) {
          localStorage.setItem('accessToken', newAt);
          setOk(true);
        } else {
          setOk(false);
        }
      } catch {
        setOk(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return null; // 또는 스피너

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
