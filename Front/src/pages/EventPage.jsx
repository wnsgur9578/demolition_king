import React, { useEffect, useState } from 'react';
import '../styles/EventPage.css';
import paperSound from '../assets/sounds/paper.mp3';
import worldMap from '../assets/images/eventmode/worldmap.png';
import koreaMap from '../assets/images/eventmode/koreamap.png';
import mapP from '../assets/images/eventmode/mapp.png';
import mapM from '../assets/images/eventmode/mapm.png';
import pinImg from '../assets/images/eventmode/pin.png'; // 핀 이미지 import 추가
import mapSelectBack from '../assets/images/eventmode/mapselectback.png';
import { useNavigate } from 'react-router-dom';

function EventPage() {
  const navigate = useNavigate();
  const [isWorldMap, setIsWorldMap] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const koreapinData = [
    { id: 1, name: '서울', top: '35.2%', left: '47.4%' },
    { id: 2, name: '제주도', top: '270px', left: '44%' },
    { id: 3, name: '강원도', top: '-50px', left: '52.6%' },
    { id: 4, name: '인천', top: '12px', left: '44.2%' },
    { id: 5, name: '전주', top: '110px', left: '45.2%' },
    { id: 6, name: '대전', top: '70px', left: '48.2%' },
    { id: 7, name: '부산', top: '130px', left: '54.4%' },
    { id: 8, name: '진주', top: '120px', left: '50%' },
    { id: 9, name: '경주', top: '90px', left: '53.6%' },
    { id: 10, name: '포항', top: '80px', left: '55.6%' },
    { id: 11, name: '북한', top: '-100px', left: '44%' },
    { id: 12, name: '북한1', top: '-200px', left: '46%' },
  ];
  const worldpinData = [
    { id: 1, name: '로마', top: '-90px', left: '49%' },
    { id: 2, name: '시드니', top: '120px', left: '73.5%' },
    { id: 3, name: '이탈리아', top: '-110px', left: '50%' },
    { id: 4, name: '뉴욕', top: '-90px', left: '32.6%' },
    { id: 5, name: '이집트', top: '-42px', left: '52%' },
    { id: 6, name: '인도', top: '-50px', left: '61%' },
    { id: 7, name: '파리', top: '-112px', left: '47%' },
    { id: 8, name: '일본', top: '-72px', left: '71.5%' },
    { id: 9, name: '한국', top: '-85px', left: '69.6%' },
    { id: 10, name: '미국', top: '-100px', left: '27%' },
    { id: 11, name: '요르단', top: '-60px', left: '53.2%' },
    { id: 12, name: '페루', top: '60px', left: '33.2%' },
    { id: 13, name: '캄보디아', top: '-12px', left: '65.2%' },
    { id: 14, name: '런던', top: '-150px', left: '47%' },
  ];

  useEffect(() => {
    const audio = new Audio(paperSound);
    audio.play().catch(err => {
      console.warn('소리 재생 실패:', err);
    });
  }, []);

  // ✅ 맵을 바꾸면 이전 선택은 초기화(혼동 방지)
  useEffect(() => { setSelectedPin(null); }, [isWorldMap]);

  // ✅ 선택 확정 → 다음 페이지로 eventK/id 전달
  const handleSelect = () => {
    if (!selectedPin) {
      alert('지역을 먼저 선택하세요!');
      return;
    }
    const eventK = !isWorldMap;         // Korea면 true, World면 false
    const eventId = selectedPin.id;

    // 라우터 state로 전달 (EventGamePage에서 useLocation().state로 수신)
    navigate('/eventgame', { state: { eventK, eventId } });

    // 또는 쿼리로 넘기고 싶다면:
    // navigate(`/eventgame?eventK=${eventK}&id=${eventId}`);
  };

  const currentPins = isWorldMap ? worldpinData : koreapinData;

  return (
    <div className="event-page">
      <div className="event-background" />

      {/* 밝아지는 효과 */}
      <div className="light-mask-gradient" />

      <h1 className="event-title">이벤트 모드</h1>

      {/* 지도 + 핀을 감싸는 컨테이너 */}
      <div className="map-container">
        <img
          src={isWorldMap ? worldMap : koreaMap}
          alt={isWorldMap ? '월드맵' : '코리아맵'}
          className={isWorldMap ? 'event-worldmap' : 'event-koreamap'}
        />

        {!isWorldMap && koreapinData.map((pin) => (
            <button
              key={pin.id}
              className="pin-button"
              style={{ top: pin.top, left: pin.left }}
              onClick={() => setSelectedPin(pin)}
            >
              <img src={pinImg} alt={pin.name} />
            </button>
          ))}

          {isWorldMap && worldpinData.map((pin) => (
            <button
              key={pin.id}
              className="pin-button"
              style={{ top: pin.top, left: pin.left }}
              onClick={() => setSelectedPin(pin)}
            >
              <img src={pinImg} alt={pin.name} />
            </button>
          ))}
      </div>

      {/* 선택 영역 - 맵 종류 상관없이 표시 */}
      {selectedPin && (
        <div className="map-selection-box">
          <img src={mapSelectBack} alt="선택박스" className="map-select-background" />
          <div className="selection-content">
            <p>{selectedPin.name}</p>
            <button onClick={() => {
                if (!selectedPin) {
                  alert('지역을 먼저 선택하세요!');
                  return;
                }

                const eventK = !isWorldMap;     // Korea → true, World → false
                const eventId = selectedPin.id; // 선택된 핀 id

                navigate('/eventgame', {
                  state: { eventK, eventId }
                });
              }}
            >선택</button>
          </div>
        </div>
      )}


      <div className="event-buttons">
        <button className="event-button" onClick={() => setIsWorldMap(false)}>
          <img src={mapP} alt="버튼P" />
        </button>
        <button className="event-button" onClick={() => setIsWorldMap(true)}>
          <img src={mapM} alt="버튼M" />
        </button>
      </div>
    </div>
  );
}

export default EventPage;
