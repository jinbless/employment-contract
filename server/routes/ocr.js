import { Router } from 'express';
import { readFile } from 'fs/promises';
import { asyncHandler, validationError } from '../utils/errorHandler.js';
import { extractTextFromImage, structureText } from '../services/openaiService.js';

const router = Router();

// 이미지에서 텍스트 추출
router.post('/extract', asyncHandler(async (req, res) => {
  if (!req.file) {
    throw validationError('파일이 업로드되지 않았습니다.');
  }

  const fileBuffer = await readFile(req.file.path);
  const base64Image = fileBuffer.toString('base64');

  const extractedText = await extractTextFromImage(base64Image);
  console.log('✅ OCR 추출 완료');

  res.json({ success: true, extractedText });
}));

// 텍스트 구조화
router.post('/structure', asyncHandler(async (req, res) => {
  const { extractedText } = req.body;

  if (!extractedText) {
    throw validationError('추출된 텍스트가 없습니다.');
  }

  const structuredData = await structureText(extractedText);
  console.log('✅ 구조화 완료');

  res.json({ success: true, structuredData });
}));

export default router;
