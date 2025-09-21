// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { bootstrapAuth } from './utils/api'; // ← 추가

const root = ReactDOM.createRoot(document.getElementById('root'));

// 1) 앱 시작 시, refresh 쿠키로 access 토큰 재발급 시도
bootstrapAuth()
  .catch(() => {}) // 실패해도 무시(그냥 비로그인 상태로 시작)
  .finally(() => {
    // 2) 초기화가 끝난 뒤에 렌더링
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });