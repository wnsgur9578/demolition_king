import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api'; // ✅ axios 인스턴스 기반
import '../styles/AdminPage.css';
import loginBack from '../assets/images/login/loginbackf.png';
import backIcon from '../assets/images/back.png';
import AnimatedPage from '../components/AnimatedPage';

function AdminPage() {
  const navigate = useNavigate();

  const handleMemberListClick = () => {
    // 회원 리스트 페이지로 이동
    navigate('/member-list');
  };

  const handleMemberDeleteClick = () => {
    // 회원 탈퇴 페이지로 이동
    navigate('/member-delete');
  };

  const handleBugReportClick = () => {
    // 버그 리포트 페이지로 이동
    navigate('/bug-report');
  };

  return (
    <AnimatedPage>
      <div
        className="login-page-background"
        style={{ backgroundImage: `url(${loginBack})` }}
      >
        <div className="admin-buttons-container">
          <button className="admin-button" onClick={handleMemberListClick}>
            회원 리스트
          </button>
          <button className="admin-button" onClick={handleMemberDeleteClick}>
            회원 탈퇴
          </button>
          <button className="admin-button" onClick={handleBugReportClick}>
            버그 리포트
          </button>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default AdminPage;
