// openvidu-proxy/index.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch');
const app = express();
const port = 5000;

const OPENVIDU_URL = process.env.OPENVIDU_URL;
const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET; // OpenVidu 실행 시 사용한 비밀번호와 동일해야 함

app.use(cors());
app.use(express.json());

// ✅ 토큰 생성 API
app.post('/api/get-token', async (req, res) => {
  const sessionId = req.body.sessionId || 'TestSession';

  try {
    // 1) 세션 생성
    const sessionRes = await fetch(`${OPENVIDU_URL}/openvidu/api/sessions`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`OPENVIDUAPP:${OPENVIDU_SECRET}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customSessionId: sessionId }),
    });

    const session = await sessionRes.json();

    // 2) 토큰 생성
    const tokenRes = await fetch(`${OPENVIDU_URL}/openvidu/api/sessions/${session.id}/connection`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`OPENVIDUAPP:${OPENVIDU_SECRET}`).toString('base64'),
        'Content-Type': 'application/json',
      },
    });

    const token = await tokenRes.json();
    res.json({ token: token.token });
  } catch (err) {
    console.error('❌ 토큰 생성 실패:', err);
    res.status(500).json({ error: 'Token creation failed' });
  }
});

app.listen(port, () => {
  console.log(`✅ OpenVidu 프록시 서버 실행됨: http://localhost:${port}`);
});
