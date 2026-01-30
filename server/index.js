import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 서비스
import { initOpenAI, updatePrompts } from './services/openaiService.js';
import { initDataService, buildXlsxIndex, loadContractItems } from './services/dataService.js';

// 라우터
import adminRoutes, { initAdminRoutes, updateAdminPrompts } from './routes/admin.js';
import ocrRoutes from './routes/ocr.js';
import analysisRoutes from './routes/analysis.js';
import tipsRoutes from './routes/tips.js';

// 유틸리티
import { errorMiddleware } from './utils/errorHandler.js';

// 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROMPTS_FILE = join(__dirname, 'prompts.json');

// 환경 변수 로드
dotenv.config({ path: join(__dirname, '.env') });

// Express 앱 초기화
const app = express();
console.log('🔄 Server restarting... Loading new environment variables.');

// 파일 업로드 설정
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (ext === 'csv') {
        cb(null, __dirname);
      } else {
        cb(null, join(__dirname, '..'));
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  })
});

// 미들웨어
app.use(cors());
app.use(express.json());

// 프롬프트 데이터
let dynamicPrompts = {};

async function loadPrompts() {
  try {
    const data = await readFile(PROMPTS_FILE, 'utf-8');
    dynamicPrompts = JSON.parse(data);
    console.log('✅ 프롬프트 데이터 로드 완료');
  } catch (error) {
    console.error('❌ 프롬프트 로드 실패:', error);
  }
}

// 프로덕션 환경에서 정적 파일 서빙 (빌드된 프론트엔드)
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use('/contract', express.static(distPath));
  console.log('📁 정적 파일 서빙 활성화:', distPath);
}

// 라우터 등록 (upload 미들웨어 적용)
app.use('/api/admin', upload.single('file'), adminRoutes);
app.use('/api/ocr', upload.single('file'), ocrRoutes);
app.use('/api', analysisRoutes);
app.use('/api/tips', tipsRoutes);

// SPA 라우팅 지원 (프론트엔드 라우트)
if (existsSync(distPath)) {
  app.get('/contract/*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// 에러 핸들링 미들웨어
app.use(errorMiddleware);

// 서버 시작
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);

  // 프롬프트 로드
  await loadPrompts();

  // 서비스 초기화
  initDataService(__dirname);
  initOpenAI(process.env.OPENAI_API_KEY, dynamicPrompts);
  initAdminRoutes(dynamicPrompts, PROMPTS_FILE);

  // 데이터 로드
  await loadContractItems();
  await buildXlsxIndex();

  // 프롬프트 변경 시 서비스 업데이트를 위한 참조 설정
  updatePrompts(dynamicPrompts);
  updateAdminPrompts(dynamicPrompts);
});
