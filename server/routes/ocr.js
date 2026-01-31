import { Router } from 'express';
import { readFile } from 'fs/promises';
import { asyncHandler, validationError } from '../utils/errorHandler.js';
import { extractTextFromImage, structureText } from '../services/openaiService.js';

const router = Router();

// 이미지에서 텍스트 추출
router.post('/extract', asyncHandler(async (req, res) => {
  console.log('📥 OCR 추출 요청 수신');

  if (!req.file) {
    console.log('❌ 파일 없음');
    throw validationError('파일이 업로드되지 않았습니다.');
  }

  console.log('  - 파일명:', req.file.originalname);
  console.log('  - 파일 크기:', Math.round(req.file.size / 1024), 'KB');
  console.log('  - MIME 타입:', req.file.mimetype);
  console.log('  - 저장 경로:', req.file.path);

  const fileBuffer = await readFile(req.file.path);
  const base64Image = fileBuffer.toString('base64');

  const extractedText = await extractTextFromImage(base64Image);
  console.log('✅ OCR 추출 완료, 결과 길이:', extractedText?.length || 0, '자');

  res.json({ success: true, extractedText });
}));

// 텍스트 구조화
router.post('/structure', asyncHandler(async (req, res) => {
  console.log('📥 구조화 요청 수신');
  const { extractedText } = req.body;

  if (!extractedText) {
    console.log('❌ 텍스트 없음');
    throw validationError('추출된 텍스트가 없습니다.');
  }

  console.log('  - 입력 텍스트 길이:', extractedText.length, '자');

  const structuredData = await structureText(extractedText);
  console.log('✅ 구조화 완료');

  res.json({ success: true, structuredData });
}));

export default router;
