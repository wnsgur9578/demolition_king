import React from 'react';
import fbottom from '../../assets/images/main/fbottom.png';

const FriendFloatingButton = ({ 
  isDisabled, 
  friendRequestCount, 
  onClick 
}) => {
  return (
    <div className="friend-buttons">
      <button
        className={`floating-button ${isDisabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={isDisabled}
      >
        <img src={fbottom} alt="플로팅 버튼" />

        {/* 친구 요청 배지 표시 */}
        {friendRequestCount > 0 && (
          <div className="friend-request-badge">
            {friendRequestCount}
          </div>
        )}
      </button>
    </div>
  );
};

export default FriendFloatingButton;
