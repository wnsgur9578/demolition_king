## 🥊 주먹이 운다 (E106)

> 권투 기반 철거 게임
한때 챔피언을 꿈꾸던 복서, 이제는 철거 현장에서 주먹으로 세상을 부순다!
싱글·멀티 모드, 모션 인식, 랭킹 시스템까지 갖춘 차세대 액션 게임 🎮

---

## 📆 프로젝트 기간

**2025.07.14 ~ 2025.08.18 (7주)**

---

## 📔 프로젝트 개요

- 권투 액션과 철거 시뮬레이션을 결합한 신개념 체감형 게임
- OpenVidu + LiveKit 기반 멀티플레이 실시간 대전
- MediaPipe 기반 모션 인식으로 실제 복싱 동작을 게임 속 액션으로 반영
- 건물 파괴, 스테이지 클리어, 골드 획득, 랭킹 시스템 탑재
- 칼로리 소모량까지 측정하는 피트니스 요소 결합

---

## 👥 팀원 소개

### 👤 박민준 (팀장)

![박민준](/uploads/acc15c913a8e48326fbacba6189c57e5/박민준.png)

- **이메일**
    - qkralswns924@naver.com
- **담당**
    - FRONTEND
      - 회원가입/로그인 페이지 구현 및 백엔드 연동
      - 메인 화면 / 게임 화면 UI 개발
      - 캐릭터, 건물, 이펙트 등 스프라이트 제작 및 적용
      - 게임 홍보 동영상 제작
    - BACKEND

---

### 👤 윤혜진

![윤혜진](/uploads/260e3afc8e0932700e553826c996b72a/윤혜진.png)

- **이메일**
    - yhjyhw1004@naver.com
- **담당**
    - FRONTEND
      - Figma로 서비스 전반의 UI/UX를 설계하고 이를 토대로 실제 화면 디자인을 구현
      - Axios 기반 API 통신 모듈을 작성하고 백엔드와 연동하여 주요 기능을 구현
      - PixiJS를 활용한 게임 화면 렌더링
      - 배경음악이 페이지 전환 시에도 이어지도록 AudioContext와 localStorage 적용 
      - 모달·토스트 알림 및 상태 시각화(초대 버튼 비활성화, 친구 온라인 표시 등)를 통해 UX를 강화
    - BACKEND


---

### 👤 조창현

![조창현](/uploads/f8a8df174c2e1b8b900ddafa01914425/조창현.png)

- **이메일**
    - ch392930@naver.com
- **담당**
    - FRONTEND
      - WebRTC 및 OpenVidu 기반 실시간 통신 기능 구현
      - 멀티 로비 페이지 설계 및 구현
      - 프로젝트 발표 자료(PPT) 제작
    - BACKEND


---

### 👤 장준혁

![장준혁](/uploads/2f42fb94f136a460139d7db1728ca5dc/장준혁.png)

- **이메일**
    - wnsgur9578@naver.com
- **담당**
    - FRONTEND
      - 멀티로비 입장 및 openvidu 통신 구현
      - 멀티플레이 구현
      - mediapipe를 활용한 함수 기반 모션 인식 개선 및 구현
    - BACKEND
      - REDIS + SSE를 활용한 실시간 통신 로직 구현
      - 친구기능 실시간 통신을 활용하여 구현, 리더보드 API 작
      - 멀티플레이에 필요한 API 필요에 맞게 수정
    - AI
      - MEDIAPIPE 관절 데이터를 활용하여 LSTM, GRU, TRANSFORMER시계열 모델등을 활용하여 펀치모션 인식 모델 학습
      - 데이터 직접 수집 및 정제

---

### 👤 신유빈

![신유빈](/uploads/8707b67f434a586e7c968f5c3ba1eaf4/신유빈.png)

- **이메일**
    - syb0317timo12@gmail.com
- **담당**
   - FRONTEND
        - 소셜 로그인(구글/카카오) 연동
        - 자동 로그인 및 토큰 갱신 로직 구현
    - BACKEND
        - OAuth2 기반 소셜 로그인 API 구현
        - JWT 인증/인가 로직 구현
        - 칼로리 및 플레이 시간, 도감정보, 회원정보 변경 등 마이페이지 관련 API 작업
        - 게임 콤보, 이벤트맵 API 구현
        - MySQL 기반 DB 설계
---

### 👤 홍지훈

![홍지훈](/uploads/7bab878575f35ab2c866b74406eaff1b/홍지훈.png)

- **이메일**
    - wlgns9807@naver.com
- **담당**
    - FRONTEND
      - 게임 코어 로직 구현
      - WebRtc 기반 프론트엔드 배포 환경 구성 (MediaPipe · OpenVidu)  
    - BACKEND
      - 게임과 관련된 통계, 골드, 건물 생성, 스킨 API 작업
      - SMTP 기반 이메일 인증 API 작업
      - Spring Security JWT 인증 뼈대구성
      - AWS EC2, Nginx, Openvidu, Livekit 영속성 인프라 작업
      - Docker, Jenkins CI/CD PipeLine 구성

---

## 🧰 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| **Language** | `Java`, `JavaScript` |
| **Backend** | `Spring Boot 3.4.5`, `Spring Security`, `JPA`, `JWT`, `Livekit` , `SMTP` |
| **Frontend** | `React`, `Pixi.js`, `Openvidu3.3.0`, `MediaPipe` |
| **DB** | `MySQL`, `Redis` |
| **DevOps** | `Git`, `Docker`, `Docker-Compose` , `AWS EC2`, `Jenkins`, `Nginx` |

---


## 📁 문서

### 🛠 시스템 아키텍처
![image](/uploads/bf8a54eb3469d9dac00bcb8acd5461cc/image.png){width=539 height=473}

### 🧩 ERD
![image](/uploads/343c2f45c061dec181bfd35e0f554c92/image.png){width=1029 height=1019}

---

## **🖥️ 주요 기능**

## 🏠**초기 화면(Web)**

| ![초기-_online-video-cutter.com_](/uploads/800cdfcbac23dc5f194cf768105eae96/초기-_online-video-cutter.com_.gif)|
| --- |
| **초기 화면** <br> 게임 첫 진입 페이지로, 사용자의 상호작용을 통해 로그인 페이지로 진입할수있습니다. |

### 🔐 **로그인 기능**

| ![로그인-_online-video-cutter.com_](/uploads/4b10a07ec6db65dde981d3dc683deae0/로그인-_online-video-cutter.com_.gif) |![소셜로그인-_online-video-cutter.com_](/uploads/ae44de71eaeb656ad5d5c1dff01e4867/소셜로그인-_online-video-cutter.com_.gif)|
| --- | --- |
| **로그인 화면** <br> 로그인을 진행하며 메인 페이지로 이동 가능합니다. | **소셜로그인 화면** <br> 소셜계정을 통해 회원가입을 진행할 수 있습니다. |

| ![bibun-ezgif.com-speed](/uploads/5a376874c8193929ccf61f85188290ea/bibun-ezgif.com-speed.gif) | ![sing-ezgif.com-speed](/uploads/90b3f16ecd58d7109be358487151eaf9/sing-ezgif.com-speed.gif) |
| --- | --- |
| **비밀 번호 찾기** <br> 회원의 비밀번호 찾기 기능을 제공해줍니다. | **회원가입 기능** <br> 회원의 프로필을 선택하고 초기정보를 설정합니다. |


### 🏠 **메인 화면**

| ![main-ezgif.com-speed](/uploads/bb38f887d70c37da307b33529900fd29/main-ezgif.com-speed.gif)|
| --- |
| **초기 화면** <br> 게임 첫 진입 페이지로, 사용자의 상호작용을 통해 로그인 페이지로 진입할수있습니다. |

| ![image](/uploads/2764f59bf60a895eb28ef51091505e30/image.png){width=1153 height=652} | ![image](/uploads/af57252596ca830031f9b776ac3ab38c/image.png){width=1153 height=648} |
| --- | --- |
| **랭킹 상세 조회** <br> 유저들간의 랭킹을 상세 조회할수 있습니다. | **플레이 가이드** <br> 플레이 가이드를 사용자에게 제공해줍니다. |

| ![invite-ezgif.com-speed](/uploads/ca1d516996e0fe3caaebfca4cbabb19e/invite-ezgif.com-speed.gif) | ![invite_re-ezgif.com-speed](/uploads/1159db49c5a505494f0ad9d66429dffb/invite_re-ezgif.com-speed.gif) |
| --- | --- |
| **친구 초대 기능** <br> 닉네임으로 친구를 초대할수 있습니다. | **친구 수락 조회 기능** <br> 친구요청을 수락할수 있고 조회할수 있습니다. |

| ![buy-ezgif.com-speed](/uploads/6f7dc367cd520362072afeaf4f17ebad/buy-ezgif.com-speed.gif)|
| --- |
| **캐릭터 구매,선택 화면** <br> 캐릭터를 구매하고 선택할수 있습니다. |

| ![gold-ezgif.com-speed](/uploads/19592edec7d008d43cc85345dbc117b9/gold-ezgif.com-speed.gif) | ![list-ezgif.com-speed](/uploads/e1f873784fbe4cf0c1f992072bf3917a/list-ezgif.com-speed.gif) |
| --- | --- |
| **플레이어 구매 선택기능** <br> 게임 플레이로 얻은 골드로 스킨을 선택하고 구매할수 있습니다. | **건물 컬렉션 조회** <br> 게임 플레이를 하며 부순 건물을 조회할수 있습니다. |

### 🏠 **게임 화면**

| ![show_note2-ezgif.com-speed](/uploads/5fa79e75a5ea039588c3cc2130cc1885/show_note2-ezgif.com-speed.gif) | ![event-ezgif.com-speed](/uploads/adf4448f0e93769649683c1e6ebc4e3d/event-ezgif.com-speed.gif) |
| --- | --- |
| **싱글 플레이 화면** <br> 싱글 플레이로 혼자서 게임을 즐길수 있습니다. | **이벤트 플레이 화면** <br> 각 지역 랜드마크 건물을 보유한 이벤트 맵을 즐길수 있습니다. |

| ![multi6](/uploads/a479bb42526549720641cc53fb10b2e6/multi6.gif) |
| --- |
| **멀티 플레이 화면** <br> 멀티 플레이로 4인이서 게임을 즐길수 있습니다. |
