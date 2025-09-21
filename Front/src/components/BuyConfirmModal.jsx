// components/ConfirmModal.jsx
import React from 'react';
import '../styles/BuyConfirmModal.css'; // CSS 별도 파일로 분리

function BuyConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-button yes" onClick={onConfirm}>네, 구매할래요</button>
          <button className="confirm-button no" onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default BuyConfirmModal;
