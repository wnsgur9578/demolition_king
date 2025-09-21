import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import findIcon from '../../assets/images/main/find.png';
import newIcon from '../../assets/images/main/new.png';
import fcbottom from '../../assets/images/main/fcbottom.png';

const FriendManager = ({ 
  userInfo, 
  isOpen, 
  onClose, 
  onFriendRequest,
  onToast 
}) => {
  // 친구 관련 상태
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
  const [hasReceivedRequest, setHasReceivedRequest] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [isMyself, setIsMyself] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  // 친구 요청 목록 불러오기
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await api.get('/users/friends/requests');
        const requestList = res.data.result || [];
        setFriendRequests(requestList);
      } catch (error) {
        console.error('❌ 친구 요청 목록 불러오기 실패:', error);
      }
    };

    fetchFriendRequests();
  }, []);

  // 친구 목록 불러오기
  useEffect(() => {
    const fetchFriendStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await api.get('/users/friends/status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const friendList = res.data.result || [];
        setFriends(friendList);
      } catch (error) {
        console.error('❌ 친구 목록 불러오기 실패:', error);
      }
    };

    if (userInfo?.userUuid) {
      fetchFriendStatus();
    }
  }, [userInfo]);

  // 친구 수락
  const acceptFriend = async (requestId) => {
    const accepted = friendRequests.find(req => req.id === requestId);
    if (!accepted) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await api.patch('/users/friends/accept', null, {
        params: { friendUuid: accepted.userUuid },
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(prev => {
        if (prev.some(f => f.friendUuid === accepted.userUuid)) return prev;
        return [
          ...prev,
          {
            id: accepted.id,
            friendUuid: accepted.userUuid,
            friendNickname: accepted.friendNickname,
            status: 'offline',
          },
        ];
      });

      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      onToast?.('✅ 친구 요청을 수락했습니다!');
    } catch (error) {
      console.error('❌ 친구 수락 실패:', error);
      alert('친구 수락에 실패했습니다.');
    }
  };

  // 친구 거절
  const rejectFriend = async (requestId) => {
    const rejected = friendRequests.find(req => req.id === requestId);
    if (!rejected) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await api.delete('/users/friends/reject', {
        params: { friendUuid: rejected.userUuid },
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      onToast?.('❌ 친구 요청을 거절했습니다.');
    } catch (error) {
      console.error('❌ 친구 거절 실패:', error);
      alert('친구 거절에 실패했습니다.');
    }
  };

  // 친구 검색
  const handleSearchFriend = async () => {
    setHasSearched(true);
    setIsAlreadyFriend(false);
    setHasReceivedRequest(false);
    setIsMyself(false);
    
    try {
      const res = await api.get(`/users/friends/search`, {
        params: { nickname: searchNickname },
      });

      const result = res.data.result;
      setSearchResult(result);

      const token = localStorage.getItem('accessToken');
      const myUuid = localStorage.getItem('userUuid');

      if (result.userUuid === myUuid) {
        setIsMyself(true);
        return;
      }

      // 현재 친구인지 확인
      const statusRes = await api.get('/users/friends/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const myFriendList = statusRes.data.result || [];
      const isFriend = myFriendList.some(friend => friend.friendUuid === result.userUuid);
      if (isFriend) {
        setIsAlreadyFriend(true);
        return;
      }

      // 받은 친구 요청 확인
      const receivedRes = await api.get('/users/friends/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const receivedRequests = receivedRes.data.result || [];
      const hasReceivedRequest = receivedRequests.some(
        (req) => req.userUuid === result.userUuid
      );

      if (hasReceivedRequest) {
        setHasReceivedRequest(true);
        return;
      }
    } catch (err) {
      console.error('❌ 친구 검색 실패:', err);
      setSearchResult(null);
    }
  };

  // 친구 요청
  const handleSendFriendRequest = async (friendUuid) => {
    const token = localStorage.getItem('accessToken');

    try {
      const statusRes = await api.get('/users/friends/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const myFriendList = statusRes.data.result;
      const isAlreadyFriend = myFriendList.some(friend => friend.friendUuid === friendUuid);

      if (isAlreadyFriend) {
        return;
      }

      await api.post('/users/friends/invite', null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { friendUuid },
      });

      setHasSentRequest(true);
      onToast?.('📩 친구 요청을 보냈습니다!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || '서버 오류가 발생했습니다.';
      // alert(`❌ 친구 요청 실패: ${errorMsg}`);
      onToast?.('📩 이미 요청을 보냈습니다!');
    }
  };

  // 친구 삭제
  const handleDeleteClick = (friendUuid) => {
    setDeleteTarget(friendUuid);
    setShowDeleteConfirm(true);
    setDeleteMessage("");
  };

  const confirmDeleteFriend = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setDeleteMessage("❌ 로그인이 필요합니다.");
      return;
    }

    try {
      await api.delete('/users/friends', {
        params: { friendUuid: deleteTarget },
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(prev => prev.filter(friend => friend.friendUuid !== deleteTarget));
      setDeleteMessage("✅ 친구가 삭제되었습니다.");
      onToast?.('✅ 친구를 삭제했습니다.');
    } catch (error) {
      console.error("❌ 친구 삭제 실패:", error);
      setDeleteMessage("❌ 친구 삭제에 실패했습니다.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // 친구 새로고침
  const refreshFriendData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const [friendRes, requestRes] = await Promise.all([
        api.get('/users/friends/status', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/users/friends/requests'),
      ]);

      setFriends(friendRes.data.result || []);
      setFriendRequests(requestRes.data.result || []);
      onToast?.('🔄 친구 목록을 새로고침했습니다.');
    } catch (err) {
      console.error('❌ 친구 새로고침 실패:', err);
    }
  };

  // 팝업 닫기 시 상태 초기화
  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchNickname('');
    setSearchResult(null);
    setHasSearched(false);
    setIsAlreadyFriend(false);
    setHasSentRequest(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="friend-popup-overlay" onClick={handleClose}>
      <div className="friend-popup" onClick={(e) => e.stopPropagation()}>
        <button className="friend-popup-close-btn" onClick={handleClose}>
          <img src={fcbottom} alt="닫기 버튼" />
        </button>
        
        <div className="friend-popup-content">
          {/* 내 정보 */}
          <div className="my-profile">
            <img className="friend-avatar" src={userInfo?.profile?.image} alt="프로필" />
            <div className="friend-nickname">{userInfo?.userNickname} (나)</div>
          </div>
          
          <hr className="friend-divider" />
          
          {/* 친구 리스트 */}
          <div className="friend-title">
            친구목록
            <img 
              src={findIcon} 
              alt="친구 찾기" 
              className="find-button" 
              onClick={() => setIsSearchOpen(true)}
            />
            
            {/* 친구 찾기 팝업 */}
            {isSearchOpen && (
              <div className="friend-search-popup" onClick={() => setIsSearchOpen(false)}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                  <h3 className="search-title">친구 찾기</h3>

                  <div className="search-row">
                    <input
                      type="text"
                      value={searchNickname}
                      onChange={(e) => setSearchNickname(e.target.value)}
                      placeholder="닉네임 입력"
                      className="search-input"
                    />
                    <button className="search-btn" onClick={handleSearchFriend}>검색</button>
                  </div>

                  {hasSearched ? (searchResult ? (
                    <div className="search-result">
                      <div className="search-result-row">
                        <div className="nickname-label">닉네임: {searchResult.uerNickname}</div>

                        {isMyself ? (
                          <div className="already-friend-text">🙋‍♂️ 본인입니다</div>
                        ) : isAlreadyFriend ? (
                          <div className="already-friend-text">✅ 이미 친구입니다</div>
                        ) : hasReceivedRequest ? (
                          <div className="already-friend-text">📩 이 사용자가 당신에게 친구 요청을 보냈습니다. 수락해주세요!</div>
                        ) : hasSentRequest ? (
                          <div className="already-friend-text">✅ 친구 요청을<br />보냈습니다!</div>
                        ) : (
                          <button
                            className="friend-request-btn"
                            onClick={() => handleSendFriendRequest(searchResult.userUuid)}>
                            친구 요청
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="search-result">
                      <div className="search-result-empty">닉네임을 찾을 수 없습니다.</div>
                    </div>
                  )) : null}

                  <button className="close-button" onClick={() => setIsSearchOpen(false)}>
                    ❌닫기
                  </button>
                </div>
              </div>
            )}

            <img 
              src={newIcon} 
              alt="새로고침" 
              className="new-button" 
              onClick={refreshFriendData}
            />
          </div>
          
          {/* 친구 목록 리스트 */}
          <div className="friend-list">
            {friends.map(friend => (
              <div key={friend.id} className="friend-item">
                <div className="friend-info-wrapper">
                  <div 
                    className="friend-status-dot"
                    style={{ 
                      backgroundColor: friend.status === 'online' ? '#00ff5f' : '#ffffff', 
                      border: '1px solid gray'
                    }}
                  />
                  <div className="friend-nickname">{friend.friendNickname}</div>
                </div>

                <button 
                  className="friend-delete-btn" 
                  onClick={() => handleDeleteClick(friend.friendUuid)}
                > 
                  삭제
                </button>
              </div>
            ))}
          </div>

          {/* 삭제 확인 모달 */}
          {showDeleteConfirm && (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">⚠️ 친구 삭제</h3>
                <p className="modal-message">정말 이 친구를 삭제하시겠습니까?</p>
                {deleteMessage && <p className="delete-message">{deleteMessage}</p>}
                <div className="modal-friend-actions">
                  <button className="confirm-btn" onClick={confirmDeleteFriend}>
                    삭제
                  </button>
                  <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 친구 요청 알림 */}
          {friendRequests.length > 0 && (
            <>
              <hr className="friend-divider" />
              <div className="friend-title">친구 요청</div>
              <div className="friend-request-section">
                {friendRequests.map((req) => (
                  <div key={req.id} className="friend-request-item">
                    <div className="friend-nickname">{req.friendNickname}</div>
                    <div className="friend-request-buttons">
                      <button onClick={() => acceptFriend(req.id)}>✅</button>
                      <button onClick={() => rejectFriend(req.id)}>❌</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendManager;
