import React, { useEffect, useState } from 'react';
import api from '../utils/api';

import leaderboardImg from '../assets/images/main/leaderboard.png';
import myLankImg from '../assets/images/main/mylank.png';
import lankBackImg from '../assets/images/main/lankback.png';
import '../styles/RankingModal.css';

export default function RankingModal({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  // ⬇️ 추가
  const [me, setMe] = useState(null);


  useEffect(() => {
  let ignore = false;
  (async () => {
    try {
      setLoading(true);

      // Top10
      const { data } = await api.get('/statistics/leaderboard/top');
      if (!ignore) setRows(Array.isArray(data) ? data.slice(0, 10) : []);

      // ⬇️ 내 랭킹
      const token = localStorage.getItem('accessToken');
      if (token) {
        const meRes = await api.get('/statistics/leaderboard/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ignore) setMe(meRes.data);
      }
    } catch (e) {
      if (!ignore) setErr('랭킹을 불러오지 못했어요.');
    } finally {
      if (!ignore) setLoading(false);
    }
  })();
  return () => { ignore = true; };
}, []);


  // 좌/우 컬럼 분할
  const left = rows.slice(0, 5);
  const right = rows.slice(5, 10);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ranking-modal" onClick={(e) => e.stopPropagation()}>
        {/* 위쪽 로고 */}
        <img src={leaderboardImg} alt="리더보드" className="ranking-logo" />

        {/* 배경 이미지 + 오버레이 리스트 */}
        <div className="board-wrap">
          <img src={lankBackImg} alt="랭킹 배경" className="board-img" />

          <div className="board-overlay">
            {loading && <div className="board-status">불러오는 중…</div>}
            {err && <div className="board-status error">{err}</div>}

            {!loading && !err && (
              <div className="board-cols">
                {/* 왼쪽 1~5 */}
                <ul className="board-col">
                  {left.map((r, i) => (
                    <li className="row" key={`L-${i}`}>
                      <span className="rank">{r.rank}.</span>
                      <span className="nick" title={r.nickname}>{r.nickname}</span>
                      <span className="score">{r.score}</span>
                    </li>
                  ))}
                </ul>

                {/* 오른쪽 6~10 */}
                <ul className="board-col">
                  {right.map((r, i) => (
                    <li className="row" key={`R-${i}`}>
                      <span className="rank">{r.rank}.</span>
                      <span className="nick" title={r.nickname}>{r.nickname}</span>
                      <span className="score">{r.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 오른쪽 아래 안내 텍스트 */}
            <div className="board-note">※ 건물 부순 개수</div>
          </div>
        </div>

        {/* 내 랭크(원하신 배경 이미지) */}
        <div className="my-rank">
          <img src={myLankImg} alt="내 랭크" className="my-rank-img" />
          <div className="my-rank-overlay">
            {me ? (
              <>
                <span className="my-label">내 랭킹</span>
                <div className="my-center">
                  <span className="my-rank-no">{me.rank}.</span>
                  <span className="my-nick" title={me.nickname}>{me.nickname}</span>
                </div>
                <span className="my-score">{me.score}</span>
              </>
            ) : (
              <span className="my-loading">불러오는 중…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
