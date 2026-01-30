import { Router } from 'express';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { asyncHandler, validationError } from '../utils/errorHandler.js';
import { listDatabaseFiles, getServerDir, getRootDir } from '../services/dataService.js';

const router = Router();
let promptsRef = null;
let promptsFilePath = '';

/**
 * 관리자 라우터 초기화
 */
export function initAdminRoutes(prompts, promptsFile) {
  promptsRef = prompts;
  promptsFilePath = promptsFile;
}

/**
 * 프롬프트 참조 업데이트
 */
export function updateAdminPrompts(prompts) {
  promptsRef = prompts;
}

/**
 * 프롬프트 참조 반환
 */
export function getPrompts() {
  return promptsRef;
}

// 프롬프트 조회
router.get('/prompts', (req, res) => {
  res.json(promptsRef);
});

// 프롬프트 저장
router.post('/prompts', asyncHandler(async (req, res) => {
  Object.assign(promptsRef, req.body);
  await writeFile(promptsFilePath, JSON.stringify(promptsRef, null, 2), 'utf-8');
  res.json({ success: true, message: '프롬프트가 저장되었습니다.' });
}));

// 파일 목록 조회
router.get('/files', asyncHandler(async (req, res) => {
  const dbFiles = await listDatabaseFiles();
  res.json(dbFiles);
}));

// 파일 업로드
router.post('/files/upload', (req, res) => {
  if (!req.file) {
    throw validationError('파일이 없습니다.');
  }
  console.log(`파일 업로드 완료: ${req.file.originalname}`);
  res.json({ success: true, filename: req.file.originalname });
});

// 파일 삭제
router.delete('/files/:filename', asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const rootPath = join(getRootDir(), filename);
  const serverPath = join(getServerDir(), filename);

  try {
    await unlink(rootPath);
  } catch {
    await unlink(serverPath);
  }

  res.json({ success: true });
}));

export default router;
