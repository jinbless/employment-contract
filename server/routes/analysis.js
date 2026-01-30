import { Router } from 'express';
import { asyncHandler, validationError } from '../utils/errorHandler.js';
import { classifyIntent, performLegalAnalysis, generateLegalContract } from '../services/openaiService.js';
import { filterApplicableItems, getDetailedLegalContent } from '../services/dataService.js';

const router = Router();

// 노동법 분석
router.post('/analyze', asyncHandler(async (req, res) => {
  const { structuredData, userContext } = req.body;

  if (!structuredData) {
    throw validationError('구조화된 데이터가 없습니다.');
  }

  console.log('✅ 분석 요청 수신');
  console.log('📌 사용자 컨텍스트:', userContext);

  // 사용자 컨텍스트 기본값 설정
  const businessSize = userContext?.businessSize || '5인이상';
  const workerTypes = userContext?.workerTypes || ['정규직'];

  // 적용 항목 필터링
  const applicableItems = filterApplicableItems(businessSize, workerTypes);

  // 상세 법령 가이드라인 추출 (XLSX)
  const allTopics = applicableItems.flatMap(item => [
    item.연관주제1, item.연관주제2, item.연관주제3, item.연관주제4, item.연관주제5
  ]).filter(Boolean);

  const guidelinesResult = await getDetailedLegalContent(allTopics);
  const detailedLegalGuidelines = guidelinesResult.text;
  const dbReferences = guidelinesResult.structured;

  // STEP 1: 의도 분류
  const categories = await classifyIntent(structuredData);
  console.log('📋 분류된 카테고리:', categories);

  // STEP 2: 노동법 분석
  let analysisResult = await performLegalAnalysis(
    structuredData,
    { businessSize, workerTypes },
    detailedLegalGuidelines
  );

  console.log('📄 원본 응답 길이:', JSON.stringify(analysisResult).length);

  // STEP 3: 분석 요약 통계 추가
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
  analysisResult.dbReferences = dbReferences;
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

// 랜덤 팁 제공
router.get('/tips/random', (req, res) => {
  const tips = [
    '💡 근로계약서는 근로 시작 전에 작성해야 해요',
    '💡 2026년 최저시급은 10,320원이에요',
    '💡 연차휴가는 1년간 80% 이상 출근 시 15일이 발생합니다'
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  res.json({ tip: randomTip });
});

export default router;
