// AppLayout.jsx
import React from 'react';
import backIcon from '../assets/images/back.png';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AppLayout.css';

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 특정 경로에서만 뒤로가기 버튼 보이게 하려면 조건 추가 가능
  const showBackButton = location.pathname !== '/';

  return (
    <div className="app-layout">
      {showBackButton && (
        <button className="global-back-button" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="뒤로가기" />
        </button>
      )}
      {children}
    </div>
  );
}

export default AppLayout;
