# 고용노동부 AI 노동법 분석 서비스 - 디자인 명세서

## 프로젝트 개요
- **프로젝트명**: 고용노동부 AI 노동법 분석 서비스
- **목적**: 대국민용 근로계약서, 임금명세서, 취업규칙을 AI로 분석하여 노동법 위반 여부를 검토하는 웹 서비스
- **디자인 컨셉**: "Reliable LegalTech" (핀테크의 깔끔함 + 로펌의 무게감)
- **핵심 디자인 키워드**: 
  - Trustworthy (Navy, Slate Gray)
  - Analytical (데이터 시각화, 클린 레이아웃)
  - Accessible (일반인도 직관적 사용)

## UI 이미지 레퍼런스
1. **Hero Landing Page (데스크톱)** — https://www.genspark.ai/api/files/s/49OcW4N1
2. **Document Analysis Dashboard (Split-View)** — https://www.genspark.ai/api/files/s/pzDZ7of0
3. **Mobile Camera Upload UI** — https://www.genspark.ai/api/files/s/EKvEFF7i
4. **Analysis Results - Card UI** — https://www.genspark.ai/api/files/s/GzjmpvIQ

## 디자인 시스템

### 색상 팔레트 (CSS 루트 변수)
```css
:root {
  /* Primary Colors */
  --color-navy-deep: #001F54;
  --color-blue-primary: #0056B3;
  --color-blue-hover: #004494;
  
  /* Neutral Colors */
  --color-gray-bg: #F7F7F7;
  --color-white: #FFFFFF;
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  
  /* Status Colors */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
}
```

### 타이포그래피 토큰
```css
:root {
  /* Font Family */
  --font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Font Sizes */
  --font-size-h1: 32px;
  --font-size-h2: 24px;
  --font-size-h3: 18px;
  --font-size-body: 16px;
  --font-size-small: 14px;
  --font-size-caption: 12px;
  
  /* Font Weights */
  --font-weight-bold: 700;
  --font-weight-semibold: 600;
  --font-weight-regular: 400;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### 간격 시스템
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
}
```

### 그림자 및 테두리
```css
:root {
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 9999px;
}
```

### 반응형 브레이크포인트
```css
:root {
  --breakpoint-sm: 640px;   /* 모바일 */
  --breakpoint-md: 768px;   /* 태블릿 */
  --breakpoint-lg: 1024px;  /* 작은 데스크톱 */
  --breakpoint-xl: 1280px;  /* 데스크톱 */
  --breakpoint-2xl: 1440px; /* 큰 데스크톱 */
}
```

## 화면별 상세 명세

### 4.1 Hero Landing Page (데스크톱)

#### 목적
서비스 첫인상 및 즉각적인 가치 전달

#### 레이아웃 구조
- **Navigation Bar**: 
  - height: 60px
  - background: --color-navy-deep
  - position: sticky
  - 메뉴: 홈, 산재 위험요소 자율점검, 근로계약서, 임금명세서, 취업규칙, 로그인

- **Hero Section**: 
  - padding: 80px 0
  - display: grid
  - grid-template-columns: 1fr 1fr
  - gap: 64px

#### 컴포넌트 명세

##### 로고 배지
```css
.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: var(--shadow-sm);
}

.logo-badge img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-badge span {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy-deep);
}
```

##### 헤드라인
```css
.headline {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-navy-deep);
}
```

##### 업로드 존
```css
.upload-zone {
  min-height: 280px;
  border: 2px dashed var(--color-blue-primary);
  border-radius: 12px;
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: var(--color-blue-hover);
  background: rgba(0, 86, 179, 0.05);
}
```

##### CTA 버튼
```css
.cta-button {
  padding: 16px 32px;
  background: var(--color-blue-primary);
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  background: var(--color-blue-hover);
}
```

##### 신뢰 배지
```css
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
```

#### 핵심 카피
- **헤드라인**: "당신의 노동 권리, AI가 검토해드립니다"
- **서브텍스트**: "사업장의 사진, 근로계약서, 임금명세서, 취업규칙을 업로드하면 AI가 노동법 위반 여부를 분석합니다"
- **CTA**: "분석 시작하기"
- **신뢰 요소**: 
  - ✓ 최신 근로기준법 반영
  - ✓ 무료 분석 서비스
  - ✓ 3분 이내 결과 제공

### 4.2 Document Analysis Dashboard (Split-View)

#### 목적
핵심 분석 워크플로우 화면

#### 레이아웃 구조

##### Sidebar
```css
.sidebar {
  width: 240px;
  background: var(--color-navy-deep);
  position: fixed;
  height: 100vh;
  padding: 24px;
  color: white;
}

.sidebar-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-item.active {
  background: var(--color-blue-primary);
}
```

##### 메뉴 항목
- 📋 산재 위험요소 자율점검
- 📄 근로계약서
- 💰 임금명세서
- 📑 취업규칙
- 📊 분석 기록
- ⚙️ 설정

##### Progress Bar
```css
.progress-bar {
  height: 8px;
  background: var(--color-gray-bg);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-blue-primary);
  transition: width 0.3s ease;
}
```

##### Split Container
```css
.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
}

@media (max-width: 768px) {
  .split-container {
    grid-template-columns: 1fr;
  }
}
```

##### Document Viewer
```css
.document-viewer {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 24px;
  overflow-y: auto;
}
```

##### Result Card
```css
.result-card {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid transparent;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.result-card.status-pass {
  border-left-color: var(--color-success);
}

.result-card.status-warning {
  border-left-color: var(--color-warning);
}

.result-card.status-violation {
  border-left-color: var(--color-danger);
}
```

### 4.3 Mobile Camera Upload UI

#### 목적
현장에서 즉시 촬영/업로드

#### 레이아웃 구조

##### Header
```css
.mobile-header {
  height: 56px;
  background: var(--color-navy-deep);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
```

##### Camera Frame
```css
.camera-frame {
  aspect-ratio: 3/4;
  border: 3px solid white;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin: 16px;
}
```

##### Corner Guides
```css
.corner-guide {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid white;
}

.corner-guide.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner-guide.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner-guide.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner-guide.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}
```

##### Capture Button
```css
.capture-button {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid var(--color-blue-primary);
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 72px;
  min-height: 72px;
}

.capture-button:active {
  transform: scale(0.95);
}
```

##### Tab Bar
```css
.tab-bar {
  height: 56px;
  background: var(--color-white);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
  cursor: pointer;
}

.tab-item.active {
  color: var(--color-blue-primary);
}
```

#### 탭 구성
- 🏠 홈
- 📷 촬영 (활성)
- 📋 기록
- ❓ 도움말

### 4.4 Analysis Results - Card UI

#### 목적
분석 결과의 명확한 구조화

#### 레이아웃

##### 상단 메타 정보
```css
.result-header {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
```

##### Score Circle
```css
.score-circle {
  width: 120px;
  height: 120px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.score-circle svg {
  transform: rotate(-90deg);
}

.score-value {
  position: absolute;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-navy-deep);
}
```

##### Result Card Grid
```css
.result-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .result-card-grid {
    grid-template-columns: 1fr;
  }
}
```

##### 분석 항목 카드
```css
.analysis-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy-deep);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pass {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-badge.violation {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
```

##### 개선 권고사항
```css
.recommendations {
  background: var(--color-gray-bg);
  padding: 20px;
  border-radius: 8px;
  margin-top: 24px;
}

.recommendation-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.recommendation-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
```

#### 분석 항목 카드 예시
1. **근로시간**
   - 🟢 적합 / 🟡 검토 필요 / 🔴 위반 의심

2. **임금**
   - 🟢 적합 / 🟡 최저임금 근접 / 🔴 최저임금 미달

3. **휴게시간**
   - 🟢 적합 / 🟡 명시 부족 / 🔴 미부여

4. **연차휴가**
   - 🟢 적합 / 🟡 계산 오류 가능 / 🔴 미부여

#### 메타 정보
- 분석일시: 2025.01.26 14:32
- 적용법률: 근로기준법 2025년 개정안 반영

## 접근성 가이드라인

### WCAG 2.1 AA 준수
- **색상 대비**: 
  - 일반 텍스트 4.5:1
  - 큰 텍스트 3:1

- **키보드 네비게이션**: 
  - 모든 인터랙티브 요소 접근 가능
  - Tab 키로 순차 이동
  - Enter/Space로 활성화

- **스크린 리더 지원**: 
  - ARIA 라벨 제공
  - 상태 변경 알림
  - 폼 필드 설명

- **포커스 표시**: 
  - 명확한 포커스 링
  - 색상만으로 정보 전달 금지

- **터치 타겟**: 
  - 최소 44px x 44px
  - 간격 최소 8px

## 개발 권장 기술 스택

### Frontend
- **Framework**: React 18+ / Next.js 14+
- **CSS Framework**: Tailwind CSS 3.4+
- **UI Library**: Radix UI / shadcn/ui
- **State Management**: Zustand / TanStack Query
- **Form Handling**: React Hook Form + Zod

### File & Document
- **File Upload**: react-dropzone
- **PDF Viewer**: react-pdf / PDF.js
- **OCR**: Tesseract.js / Google Vision API

### Data Visualization
- **Charts**: Recharts / Chart.js
- **Animation**: Framer Motion
- **Icons**: Lucide React / Heroicons

### Backend
- **Runtime**: Cloudflare Workers / Hono
- **AI Integration**: OpenAI API / GPT-4o
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2

## 에셋 체크리스트

### 필수 에셋
- [x] 고용노동부 공식 로고 (SVG) - https://www.genspark.ai/api/files/s/S3Om08sg
- [ ] 서비스 로고/워드마크
- [ ] Pretendard 웹폰트 (WOFF2)

### 아이콘 세트
- [x] 문서 유형 아이콘 (근로계약서, 임금명세서, 취업규칙)
- [x] 네비게이션 아이콘
- [x] 액션 아이콘 (업로드, 분석, 다운로드)
- [x] 상태 아이콘 (적합, 주의, 위반)

### 이미지
- [x] 히어로 이미지
- [ ] Empty State 일러스트
- [ ] 로딩 애니메이션

## 시스템 아키텍처

### 데이터 흐름
1. **이미지 업로드** → `/api/upload`
2. **OCR 추출** → 텍스트 데이터 브라우저로
3. **매핑 수정** → `/api/analyze`
4. **AnalysisService**에서 RAG 활용 및 OpenAI에 분석 요청 → JSON 응답
5. **결과 표시** 및 LawDB 참조
6. `/api/contract/generate`로 계약서 초안 생성 및 다운로드

### 주요 API 엔드포인트
- `POST /api/upload` - 파일 업로드
- `POST /api/ocr/extract` - OCR 텍스트 추출
- `POST /api/analyze` - 노동법 분석
- `POST /api/contract/generate` - 계약서 생성
- `GET /api/contract/download/:id` - 계약서 다운로드
- `GET /api/analysis/:id` - 분석 결과 조회

### 데이터 소스
- **Local DB / Excel Resources**: 노동법 참조 데이터
- **OpenAI API**: GPT-4o 기반 분석 및 초안 생성
- **LawDB**: 국가법령정보센터 링크

## 버전 정보
- **문서 버전**: v1.0
- **작성일**: 2025년 1월 26일
- **최종 수정일**: 2025년 1월 26일
- **작성자**: AI Designer (Genspark)
- **담당부서**: 고용노동부

## 연락처
- **기획/요청**: 고용노동부 [담당자명]
- **디자인**: AI Designer (Genspark)
- **개발**: [개발팀]
- **문의**: [이메일/연락처]

---

**Note**: 이 명세서는 다른 AI 시스템에서 동일한 디자인을 구현할 수 있도록 작성되었습니다. 모든 색상, 간격, 타이포그래피 값은 CSS 변수로 정의되어 있으며, 컴포넌트별 스타일 가이드가 포함되어 있습니다.
