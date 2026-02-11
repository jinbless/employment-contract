import { Router } from 'express';
import { asyncHandler, validationError } from '../utils/errorHandler.js';
import { performParallelAnalysis, generateLegalContract } from '../services/openaiService.js';
import { filterApplicableItems } from '../services/dataService.js';

const router = Router();

// 노동법 분석 (병렬 처리)
router.post('/analyze', asyncHandler(async (req, res) => {
  const { structuredData, userContext } = req.body;

  if (!structuredData) {
    throw validationError('구조화된 데이터가 없습니다.');
  }

  console.log('✅ 분석 요청 수신');
  console.log('📌 사용자 컨텍스트:', userContext);

  const businessSize = userContext?.businessSize || '5인이상';
  const workerTypes = userContext?.workerTypes || ['정규직'];

  // 적용 항목 필터링
  const applicableItems = filterApplicableItems(businessSize, workerTypes);

  // 병렬 분석 실행
  let analysisResult = await performParallelAnalysis(
    structuredData,
    { businessSize, workerTypes },
    applicableItems
  );

  // 분석 요약 통계 추가
  if (analysisResult.results && Array.isArray(analysisResult.results)) {
    const total = analysisResult.results.length;
    const violation = analysisResult.results.filter(r => r.적절성 === '부적절').length;
    const warning = analysisResult.results.filter(r => r.적절성 === '보완필요').length;
    const compliance = analysisResult.results.filter(r => r.적절성 === '적절').length;

    analysisResult.summary = {
      총항목: total,
      위반: violation,
      경고: warning,
      준수: compliance
    };
  }

  console.log('✅ 분석 완료');
  res.json(analysisResult);
}));

// 표준 근로계약서 생성
router.post('/generate/contract', asyncHandler(async (req, res) => {
  const { analysisResult } = req.body;

  if (!analysisResult) {
    throw validationError('분석 결과가 없습니다.');
  }

  const contractText = await generateLegalContract(analysisResult);
  console.log('✅ 계약서 생성 완료');

  res.json({ success: true, contractText });
}));

export default router;
