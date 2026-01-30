// 사업장 규모 옵션
export const BUSINESS_SIZES = ['5인이상', '5인미만'];

// 근로자 유형 옵션
export const WORKER_TYPES = ['정규직', '기간제', '단시간', '일용직', '연소자', '외국인'];

// 분석 단계 상수
export const ANALYSIS_STEPS = {
  UPLOAD: 1,
  STRUCTURE: 2,
  ANALYSIS: 3,
  CONTRACT: 4
};

// 진행률 상수
export const PROGRESS_INCREMENT = 5;
export const PROGRESS_MAX = 90;

// 상태 색상 (디자인 토큰)
export const STATUS_COLORS = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444'
};

// 카테고리별 색상 (법적 요구사항)
export const CATEGORY_COLORS = {
  '서면필수': '#ef4444',
  '서면필수(기간제)': '#f59e0b',
  '서면필수(단시간)': '#f59e0b',
  '명시필수': '#3b82f6',
  '필수': '#8b5cf6'
};

// 적절성 상태 색상
export const APPROPRIATENESS_COLORS = {
  '적절': '#22C55E',
  '부적절': '#EF4444',
  '보완필요': '#F59E0B'
};

// 위험도 색상
export const RISK_COLORS = {
  '상': '#EF4444',
  '중': '#F59E0B',
  '하': '#22C55E'
};
