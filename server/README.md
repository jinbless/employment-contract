# 백엔드 서버 실행 가이드

## 1. OpenAI API 키 설정

`server/.env` 파일을 열어 OpenAI API 키를 설정하세요:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
```

## 2. 서버 실행

```bash
cd server
npm start
```

## 3. 프론트엔드 연동 확인

- 프론트엔드: http://localhost:5173/
- 백엔드 API: http://localhost:3001/

백엔드가 정상 실행되면 "🚀 서버가 포트 3001에서 실행 중입니다." 메시지가 표시됩니다.
