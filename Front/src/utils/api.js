// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true  // refreshToken을 httpOnly 쿠키로 쓴다면 켜주세요
});

// 유틸: JWT exp 파싱
function getTokenExpMs(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;  // ms 단위
  } catch {
    return 0;
  }
}
 
// --- 공용: Authorization 헤더 부착 ---
api.interceptors.request.use(async (config) => {
  const access = localStorage.getItem('accessToken');

  // 1) 만료 60초 이내면 쿠키로 사전 갱신
  if (access) {
    const exp = getTokenExpMs(access);
    if (exp && exp - Date.now() < 60_000) {
      try {
        const newAccess = await refreshAccessToken(); // ⬇️ 아래 함수
        if (newAccess) localStorage.setItem('accessToken', newAccess);
      } catch {
        // 무시하고 기존 토큰으로 시도 -> 어차피 401에서 재갱신 로직 있음
      }
    }
  }

  // 2) 최신 토큰 부착
  const latest = localStorage.getItem('accessToken');
  if (latest) {
    config.headers.Authorization = `Bearer ${latest}`;
  }
  return config;
});

// --- 401 처리: 단일 갱신 후 재시도 ---
let isRefreshing = false;
let waiters = [];

function subscribe(cb) { waiters.push(cb); }
function notifyAll(token) { waiters.forEach((cb) => cb(token)); waiters = []; }

async function refreshAccessToken() {
  // refresh endpoint 자체 호출 중 중복 방지
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribe((tok) => tok ? resolve(tok) : reject(new Error('refresh failed')));
    });
  }
  isRefreshing = true;
  try {
    // 인터셉터 재귀를 피합니다.
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/user/auth/tokenrefresh`,
      {},
      { withCredentials: true }
    );
    const newAccess =
      data?.result?.accessToken ?? data?.accessToken; // BaseResponse 대응
    if (!newAccess) throw new Error('no accessToken in response');

    notifyAll(newAccess);
    return newAccess;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;

    // 네트워크 에러나 응답 없음
    if (!response) return Promise.reject(error);

    // 이미 한번 재시도했으면 패스
    if (response.status === 401 && !config._retry) {
      // refresh 엔드포인트에서 401이면 바로 로그아웃
      if (config.url?.includes('/user/auth/tokenrefresh')) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      config._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        localStorage.setItem('accessToken', newAccess);

        // 원요청 토큰 교체 후 재시도
        config.headers = { ...(config.headers || {}), Authorization: `Bearer ${newAccess}` };
        return api.request(config);
      } catch (e) {
        // 재갱신 실패 → 세션 정리
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export async function bootstrapAuth() {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/user/auth/tokenrefresh`,
      {},
      { withCredentials: true }
    );
    const newAccess = data?.result?.accessToken ?? data?.accessToken;
    if (newAccess) {
      localStorage.setItem('accessToken', newAccess);
    }
  } catch (e) {
    // 실패하면 그냥 무시 → 비로그인 상태로 시작
    localStorage.removeItem('accessToken');
  }
}

export default api;