import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import myPageModal from '../../assets/images/main/mypagemodal.png';
import pencilIcon from '../../assets/images/mypage/pencil.png';
import goldImg from '../../assets/images/mypage/gold.png';
import silverImg from '../../assets/images/mypage/silver.png';
import bronzeImg from '../../assets/images/mypage/bronze.png';

const MyPageModal = ({
  // user & close
  userInfo,
  onClose,
  handleLogout,

  // tabs & edit state
  activeTab,
  setActiveTab,
  isEditing,
  setIsEditing,
  isEditingNickname,
  setIsEditingNickname,
  editNickname,
  setEditNickname,
  nicknameCheckResult,
  checkedNickname,
  handleCheckNickname,
  handleSaveNickname,

  // password change
  isChangingPassword,
  setIsChangingPassword,
  passwordVerified,
  currentPassword,
  setCurrentPassword,
  verifyStatus,
  verifyMsg,
  verifyPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  changePwStatus,
  changePwMsg,
  changePassword,

  // withdraw
  isDeletingAccount,
  setIsDeletingAccount,
  withdrawPassword,
  setWithdrawPassword,
  withdrawError,
  showWithdrawConfirm,
  setShowWithdrawConfirm,
  handleWithdraw,
  confirmWithdrawNow,

  // profile
  isPickingProfile,
  setIsPickingProfile,
  profileOptions,
  tempProfileSeq,
  setTempProfileSeq,
  savingProfile,
  fetchProfileOptions,
  saveProfileSelection,
  showLogoutModal,
  setShowLogoutModal,

  // stats
  medals,
  playStats,
  dateRange,
  setDateRange,
  kcalLoading,
  kcalErr,
  selectedCalorieData,

  // collection
  buildingImages,
  rareImages,
  legendaryImages,
  eventImages,
  unlockedBuildings,
}) => {
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="mypage-modal-wrapper">
      <img src={myPageModal} alt="마이페이지 모달" className="mypage-modal-bg" />

      <div className="mypage-overlay">
        {/* 왼쪽: 프로필 영역 */}
        <div className="mypage-left">
          <img className="mypage-avatar" src={userInfo?.profile?.image} alt="프로필" />
          <div className="mypage-name">{userInfo?.userNickname}</div>
          <div className="mypage-email">{userInfo?.userEmail}</div>
          <button
            className={`mypage-edit-btn ${isEditing ? 'disabled' : ''}`}
            onClick={() => setIsEditing(!isEditing)}>정보수정
          </button>
          {isEditing && (
            <button
              className="mypage-edit-btn"
              onClick={async () => {
                await fetchProfileOptions();
                setIsPickingProfile(true);
              }}
            >
              프로필 변경
            </button>
          )}
          {/* 프로필 선택 팝업 */}
          {isPickingProfile && (
            <div className="modal-overlay" onClick={() => setIsPickingProfile(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>프로필 선택</h3>

                <div className="character-grid1">
                  {profileOptions.map((p) => (
                    <div
                      key={p.profileSeq}
                      className={`character-item ${tempProfileSeq === p.profileSeq ? 'selected' : ''}`}
                      onClick={() => setTempProfileSeq(p.profileSeq)}
                    >
                      <img src={p.image} alt={`profile-${p.profileSeq}`} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="cancel-btn" onClick={() => setIsPickingProfile(false)}>취소</button>
                  <button className="save-btn" onClick={saveProfileSelection} disabled={!tempProfileSeq || savingProfile}>
                    {savingProfile ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          )}
          <button className="mypage-logout-btn" onClick={() => setShowLogoutModal(true)}>로그아웃</button>
        </div>
        {showLogoutModal && (
          <div className="modal-overlay">
            <div className="modal">
              <p>정말 로그아웃 하시겠습니까?</p>
              <div className="modal-buttons">
                <button onClick={handleLogout}>네, 로그아웃</button>
                <button onClick={() => setShowLogoutModal(false)}>아니요</button>
              </div>
            </div>
          </div>
        )}

        <div className="mypage-right">
          {/* 탭 버튼 */}
          <div className="mypage-tabs">
            <button className={`tab-button ${activeTab === '통계' ? 'active' : ''}`} onClick={() => setActiveTab('통계')}>통계</button>
            <button className={`tab-button ${activeTab === '도감' ? 'active' : ''}`} onClick={() => setActiveTab('도감')}>도감</button>
          </div>

          {/* 통계 탭 내용 */}
          {activeTab === '통계' && !isEditing && (
            <>
              <div className="medal-section">
                <div className="play-label">나의 메달</div>
                <div className="medal-row-section">
                  <div className="medal-item">
                    <img src={goldImg} alt="금메달" />
                    <span className="medal-count">{medals.gold}</span>
                  </div>
                  <div className="medal-item">
                    <img src={silverImg} alt="은메달" />
                    <span className="medal-count">{medals.silver}</span>
                  </div>
                  <div className="medal-item">
                    <img src={bronzeImg} alt="동메달" />
                    <span className="medal-count">{medals.bronze}</span>
                  </div>
                </div>
              </div>

              <div className="playtime-section">
                <div className="playtime-row-vertical1">
                  <div className="play-label">누적 플레이 시간</div>
                  <div className="bar-with-text">
                    <span className="time-text">
                      {Math.floor(playStats.totalPlayTime / 60)}시간 {playStats.totalPlayTime % 60}분
                    </span>
                  </div>
                </div>

                <div className="playtime-row-vertical">
                  <div className="play-label1">오늘의 플레이 시간</div>
                  <div className="bar-with-text">
                    <div className="bar-bg">
                      <div className="bar-fill red" style={{ width: `${(playStats.todayPlayTime / 120) * 100}%` }}></div>
                    </div>
                    <span className="time-text">{playStats.todayPlayTime}분 / 권장 2시간 기준</span>
                  </div>
                </div>
              </div>

              <div className="weekly-chart-label">이번 주 게임 시간</div>
              <div className="weekly-chart">
                {playStats.weeklyPlayTime.map((minutes, i) => {
                  const maxMinutes = 300;
                  const maxHeight = 500;
                  const heightPx = Math.min((minutes / maxMinutes) * maxHeight, maxHeight);
                  const timeLabel = minutes >= 60
                    ? `${Math.floor(minutes / 60)}시간 ${minutes % 60 > 0 ? minutes % 60 + '분' : ''}`
                    : `${minutes}분`;
                  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
                  return (
                    <div key={i} className="bar-wrapper">
                      <div className="bar-column" style={{ height: `${heightPx}px` }}>
                        <div className="bar-tooltip">{timeLabel}</div>
                      </div>
                      <div className="bar-day-label">{dayLabels[i]}</div>
                    </div>
                  );
                })}
              </div>

              <div className="weekly-chart-label">칼로리를 조회해보세요!</div>
              <div className="weekly-chart-label1">시작일과 종료일을 선택하세요</div>
              <div className="calendar-section">
                <Calendar
                  onChange={setDateRange}
                  value={dateRange}
                  selectRange={true}
                  locale="ko-KR"
                  calendarType="US"
                  tileDisabled={({ date, view }) =>
                    view === 'month' &&
                    dateRange[0] &&
                    Math.abs((date - dateRange[0]) / (1000 * 60 * 60 * 24)) > 7
                  }
                />

                <div className="calendar-summary-row">
                  <div className="calendar-summary-block">
                    <div className="summary-label">시작일</div>
                    <div className="summary-date">{dateRange[0] ? formatDate(dateRange[0]) : '-'}</div>
                  </div>
                  <div className="calendar-summary-block">
                    <div className="summary-label">종료일</div>
                    <div className="summary-date">{dateRange[1] ? formatDate(dateRange[1]) : '-'}</div>
                  </div>
                </div>
              </div>

              {kcalLoading && <div className="calorie-status">불러오는 중…</div>}
              {kcalErr && <div className="calorie-status error">{kcalErr}</div>}

              {!kcalLoading && !kcalErr && selectedCalorieData.length > 0 && (
                <div className="calorie-graph-section">
                  <h3>소모 칼로리 기록</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={selectedCalorieData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="calorie" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* 정보 수정 화면 - 보기 모드 */}
          {activeTab === '통계' && isEditing && !isEditingNickname && (
            <>
              <div className="profile-view">
                <div className="info-row">
                  <label>닉네임:</label>
                  <div className="info-me">{userInfo?.userNickname}</div>
                  <button className="edit-icon-btn" onClick={() => setIsEditingNickname(true)}>
                    <img src={pencilIcon} alt="수정" className="edit-icon" />
                  </button>
                </div>
                <div className="info-row">
                  <label>이메일:</label>
                  <div className="info-me">{userInfo?.userEmail}</div>
                </div>
                <div className="info-row password-row">
                  <button
                    className="change-password-btn"
                    onClick={() => {
                      setIsChangingPassword(true);
                    }}>비밀번호 변경
                  </button>
                </div>
                <div className="delete-account-wrapper">
                  <button
                    className="delete-account-btn"
                    onClick={() => {
                      setIsDeletingAccount(true);
                      setWithdrawPassword('');
                    }}
                  >
                    회원탈퇴
                  </button>
                </div>

                {isDeletingAccount && (
                  <div className="withdraw-form">
                    <div className="password-form-header">
                      <button
                        className="close-password-btn"
                        onClick={() => {
                          setIsDeletingAccount(false);
                          setWithdrawPassword('');
                        }}
                      >
                        닫기 ❌
                      </button>
                    </div>

                    {withdrawError && (
                      <p className="withdraw-error-text">{withdrawError}</p>
                    )}

                    <input
                      type="password"
                      value={withdrawPassword}
                      onChange={(e) => {
                        setWithdrawPassword(e.target.value);
                      }}
                      placeholder="본인 확인용 비밀번호 입력"
                    />

                    <div className="password-change-buttons">
                      <button className="cancel-btn" onClick={() => setIsDeletingAccount(false)}>취소</button>
                      <button className="save-btn" onClick={handleWithdraw} disabled={!withdrawPassword}>회원탈퇴</button>
                    </div>

                    {showWithdrawConfirm && (
                      <div className="modal-overlay" onClick={() => setShowWithdrawConfirm(false)}>
                        <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                          <p>정말 탈퇴하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.</p>
                          <div className="modal-buttons">
                            <button onClick={confirmWithdrawNow}>확인</button>
                            <button onClick={() => setShowWithdrawConfirm(false)}>취소</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isChangingPassword && (
                  <div className="password-change-form">
                    <div className="password-form-header">
                      <button
                        className="close-password-btn"
                        onClick={() => {
                          setIsChangingPassword(false);
                        }}>닫기 ❌
                      </button>
                    </div>

                    {!passwordVerified ? (
                      <>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="현재 비밀번호 입력"
                        />
                        {verifyStatus && (
                          <div className={`status-line ${verifyStatus}`}>
                            <span>{verifyMsg}</span>
                          </div>
                        )}
                        <button className="verify-btn" onClick={verifyPassword}>확인</button>
                      </>
                    ) : (
                      <>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="새 비밀번호 입력 영문, 숫자 포함 8~20자, 공백 불가"
                        />
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="새 비밀번호 재입력"
                        />
                        {changePwStatus && (
                          <div className={`status-line ${changePwStatus}`}>
                            <span>{changePwMsg}</span>
                          </div>
                        )}
                        <div className="password-change-buttons">
                          <button className="cancel-btn" onClick={() => setIsChangingPassword(false)}>취소</button>
                          <button className="save-btn" onClick={changePassword}>저장</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="edit-close-wrapper">
                <button
                  className="close-edit-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setIsEditingNickname(false);
                    setEditNickname(userInfo.nickname);
                  }}
                >
                  닫기
                </button>
              </div>
            </>
          )}

          {/* 닉네임 수정 모드 */}
          {activeTab === '통계' && isEditing && isEditingNickname && (
            <div className="nickname-edit-form">
              <label className="nickname-label">닉네임을 변경해보세요</label>
              <input value={editNickname} onChange={(e) => setEditNickname(e.target.value)} className="nickname-input" />
              {nicknameCheckResult === 'available' && (
                <div className="nickname-check-success">✅ 사용 가능한 닉네임입니다.</div>
              )}
              {nicknameCheckResult === 'duplicate' && (
                <div className="nickname-check-error">❌ 이미 사용 중인 닉네임입니다.</div>
              )}
              <div className="nickname-edit-buttons">
                <button className="check-btn" onClick={handleCheckNickname}>중복확인</button>
                <button className="cancel-btn" onClick={() => { setEditNickname(userInfo.nickname); setIsEditingNickname(false); }}>취소</button>
                <button
                  className="save-btn"
                  onClick={handleSaveNickname}
                  disabled={nicknameCheckResult !== 'available' || editNickname !== checkedNickname}
                >
                  저장
                </button>
              </div>
            </div>
          )}

          {/* 도감 탭 내용 */}
          {activeTab === '도감' && !isEditing && (
            <div className="collection-section">
              <span>건물을 철거하고 도감을 채워보세요!</span>
              <div className="buildingname">COMMON</div>
              <div className="building-grid">
                {buildingImages.map(({ src, filename }, i) => {
                  const isUnlocked = unlockedBuildings.includes(filename);
                  return (
                    <div key={i} className="building-item">
                      <img src={src} alt={`건물 ${filename}`} loading="lazy" className={`building-image ${isUnlocked ? 'unlocked' : ''}`} />
                    </div>
                  );
                })}
              </div>

              <div className="buildingname1">RARE</div>
              <div className="building-grid">
                {rareImages.map(({ src, filename }, i) => {
                  const isUnlocked = unlockedBuildings.includes(filename);
                  return (
                    <div key={i} className="building-item">
                      <img src={src} alt={`건물 ${filename}`} className={`building-image ${isUnlocked ? 'unlocked' : ''}`} />
                    </div>
                  );
                })}
              </div>

              <div className="buildingname1">LEGENDARY</div>
              <div className="building-grid">
                {legendaryImages.map(({ src, filename }, i) => {
                  const isUnlocked = unlockedBuildings.includes(filename);
                  return (
                    <div key={i} className="building-item">
                      <img src={src} alt={`건물 ${filename}`} className={`building-image ${isUnlocked ? 'unlocked' : ''}`} />
                    </div>
                  );
                })}
              </div>

              <div className="buildingname1">EVENT</div>
              <div className="building-grid">
                {eventImages.map(({ src, filename }, i) => {
                  const isUnlocked = unlockedBuildings.includes(filename);
                  return (
                    <div key={i} className="building-item">
                      <img src={src} alt={`건물 ${filename}`} className={`building-image ${isUnlocked ? 'unlocked' : ''}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 도감 탭 - 편집 보기 */}
          {activeTab === '도감' && isEditing && !isEditingNickname && (
            <>
              <div className="profile-view">
                <div className="info-row">
                  <label>닉네임:</label>
                  <div className="info-me">{userInfo?.userNickname}</div>
                  <button className="edit-icon-btn" onClick={() => setIsEditingNickname(true)}>
                    <img src={pencilIcon} alt="수정" className="edit-icon" />
                  </button>
                </div>
                <div className="info-row">
                  <label>이메일:</label>
                  <div className="info-me">{userInfo?.userEmail}</div>
                </div>
                <div className="info-row password-row">
                  <button className="change-password-btn" onClick={() => { setIsChangingPassword(true); }}>비밀번호 변경</button>
                </div>
                <div className="delete-account-wrapper">
                  <button className="delete-account-btn" onClick={() => { setIsDeletingAccount(true); setWithdrawPassword(''); }}>회원탈퇴</button>
                </div>

                {isDeletingAccount && (
                  <div className="withdraw-form">
                    <div className="password-form-header">
                      <button className="close-password-btn" onClick={() => { setIsDeletingAccount(false); setWithdrawPassword(''); }}>닫기 ❌</button>
                    </div>
                    {withdrawError && (<p className="withdraw-error-text">{withdrawError}</p>)}
                    <input type="password" value={withdrawPassword} onChange={(e) => { setWithdrawPassword(e.target.value); }} placeholder="본인 확인용 비밀번호 입력" />
                    <div className="password-change-buttons">
                      <button className="cancel-btn" onClick={() => setIsDeletingAccount(false)}>취소</button>
                      <button className="save-btn" onClick={handleWithdraw} disabled={!withdrawPassword}>회원탈퇴</button>
                    </div>
                    {showWithdrawConfirm && (
                      <div className="modal-overlay" onClick={() => setShowWithdrawConfirm(false)}>
                        <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                          <p>정말 탈퇴하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.</p>
                          <div className="modal-buttons">
                            <button onClick={confirmWithdrawNow}>확인</button>
                            <button onClick={() => setShowWithdrawConfirm(false)}>취소</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isChangingPassword && (
                  <div className="password-change-form">
                    <div className="password-form-header">
                      <button className="close-password-btn" onClick={() => { setIsChangingPassword(false); }}>닫기 ❌</button>
                    </div>
                    {!passwordVerified ? (
                      <>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="현재 비밀번호 입력" />
                        <button className="verify-btn" onClick={verifyPassword}>확인</button>
                      </>
                    ) : (
                      <>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새 비밀번호 입력" />
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="새 비밀번호 재입력" />
                        <div className="password-change-buttons">
                          <button className="cancel-btn" onClick={() => setIsChangingPassword(false)}>취소</button>
                          <button className="save-btn" onClick={changePassword}>저장</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="edit-close-wrapper">
                <button className="close-edit-btn" onClick={() => { setIsEditing(false); setIsEditingNickname(false); setEditNickname(userInfo.nickname); }}>닫기</button>
              </div>
            </>
          )}

          {/* 닉네임 수정 모드 */}
          {activeTab === '도감' && isEditing && isEditingNickname && (
            <div className="nickname-edit-form">
              <label>닉네임:</label>
              <input value={editNickname} onChange={(e) => setEditNickname(e.target.value)} className="nickname-input" />
              {nicknameCheckResult === 'available' && (
                <div className="nickname-check-success">✅ 사용 가능한 닉네임입니다.</div>
              )}
              {nicknameCheckResult === 'duplicate' && (
                <div className="nickname-check-error">❌ 이미 사용 중인 닉네임입니다.</div>
              )}
              <div className="nickname-edit-buttons">
                <button className="check-btn" onClick={handleCheckNickname}>중복확인</button>
                <button className="cancel-btn" onClick={() => { setEditNickname(userInfo.nickname); setIsEditingNickname(false); }}>취소</button>
                <button className="save-btn" onClick={handleSaveNickname} disabled={nicknameCheckResult !== 'available' || editNickname !== checkedNickname}>저장</button>
              </div>
            </div>
          )}
        </div>

        {/* 닫기: 바깥 오버레이에서 처리됨 */}
        <button style={{ display: 'none' }} onClick={onClose} aria-hidden />
      </div>
    </div>
  );
};

export default MyPageModal;


