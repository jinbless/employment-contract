# 시스템 아키텍처 - 노동법 자율점검 AI

## 전체 시스템 구조

```mermaid
graph TB
    subgraph "Frontend - React + Vite"
        UI[사용자 인터페이스]
        Upload[파일 업로드]
        OCRView[OCR 결과 확인]
        StructView[구조화 폼 편집]
        ReviewView[최종 확인]
        ResultView[분석 결과]
        ContractView[계약서 작성]
    end
    
    subgraph "Backend - Express.js"
        API[REST API Server]
        OCREndpoint["/api/ocr/extract"]
        StructEndpoint["/api/ocr/structure"]
        AnalyzeEndpoint["/api/analyze/contract"]
        GenerateEndpoint["/api/generate/contract"]
    end
    
    subgraph "AI Layer - OpenAI GPT-4o"
        Vision[Vision API<br/>이미지→텍스트]
        Structure[구조화 AI<br/>텍스트→표]
        Analysis[법률 검토 AI<br/>위반사항 분석]
        Generation[계약서 생성 AI<br/>표준양식 작성]
    end
    
    subgraph "Data Layer"
        CSV1[근로계약서_updated.csv]
        CSV2[취업규칙_updated.csv]
        CSV3[임금명세서_updated.csv]
        Excel[30+ 노동법 참조 Excel 파일]
    end
    
    UI --> Upload
    Upload --> OCREndpoint
    OCREndpoint --> Vision
    Vision --> OCRView
    OCRView --> StructEndpoint
    StructEndpoint --> Structure
    Structure --> StructView
    StructView --> ReviewView
    ReviewView --> AnalyzeEndpoint
    AnalyzeEndpoint --> Analysis
    Analysis --> CSV1
    Analysis --> CSV2
    Analysis --> CSV3
    Analysis --> ResultView
    ResultView --> GenerateEndpoint
    GenerateEndpoint --> Generation
    Generation --> ContractView
    
    style UI fill:#e1f5ff
    style Vision fill:#fff4e6
    style Structure fill:#fff4e6
    style Analysis fill:#fff4e6
    style Generation fill:#fff4e6
    style CSV1 fill:#f0f0f0
    style CSV2 fill:#f0f0f0
    style CSV3 fill:#f0f0f0
```

## 워크플로우 (5단계)

```mermaid
sequenceDiagram
    participant User as 사용자
    participant FE as Frontend
    participant BE as Backend
    participant AI as GPT-4o
    participant DB as CSV & Excel DB
    
    Note over User,DB: Step 1: 사진 업로드
    User->>FE: 근로계약서 이미지 업로드
    FE->>BE: POST /api/ocr/extract
    BE->>AI: Vision API 호출
    AI-->>BE: OCR 텍스트 반환
    BE-->>FE: extractedText
    
    Note over User,DB: Step 2: AI 구조화 매핑
    FE->>BE: POST /api/ocr/structure
    BE->>AI: 구조화 프롬프트 + OCR 텍스트
    AI-->>BE: JSON 형식 데이터
    BE-->>FE: structuredData
    FE->>User: EditableStructureTable 표시
    
    Note over User,DB: Step 3: 사용자 확인/수정
    User->>FE: 구조화된 데이터 직접 수정
    FE->>User: 최종 확인 화면
    
    Note over User,DB: Step 4: 법률 분석
    User->>FE: 분석 시작 (규모/유형 조건 포함)
    FE->>BE: POST /api/analyze/contract
    BE->>DB: CSV(지침) + Excel(판례/상세) 로드
    DB-->>BE: 필수항목 및 상세 법령 컨텍스트
    BE->>AI: 검토 프롬프트 + 구조화 데이터 + 최적화된 DB 컨텍스트
    AI-->>BE: 분석 결과 (JSON)
    BE-->>FE: riskLevel, results[], recommendations
    FE->>User: 툴팁 가이드 및 클릭형 권고 사항 표시
    
    Note over User,DB: Step 5: 표준계약서 생성
    User->>FE: 계약서 생성 요청
    FE->>BE: POST /api/generate/contract
    BE->>AI: 생성 프롬프트 + 수정된 정보 반영
    AI-->>BE: 표준근로계약서 (텍스트)
    BE-->>FE: contractText
    FE->>User: 편집 가능한 계약서 표시
```

## 기술 스택

### Frontend
- **Framework**: React 18 + Vite
- **UI Library**: Framer Motion (애니메이션)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (index.css)
- **State Management**: React Hooks (useState)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **File Upload**: Multer (메모리 스토리지)
- **AI Integration**: OpenAI SDK (GPT-4o)
- **Environment**: dotenv

### AI Models
- **Vision**: GPT-4o (이미지 OCR)
- **Text Processing**: GPT-4o (구조화, 분석, 생성)

### Data
- **Format**: CSV (UTF-8)
- **Files**: 3개 주요 CSV + 30개 참조 Excel
- **Encoding**: 한글 지원

## 데이터 플로우

```mermaid
flowchart LR
    subgraph Input
        IMG[이미지 파일]
    end
    
    subgraph Processing
        OCR[OCR 추출]
        STRUCT[구조화]
        EDIT[사용자 수정]
    end
    
    subgraph Analysis
        DB[(CSV DB)]
        AI_ANALYZE[AI 법률 검토]
        RESULT[분석 결과]
    end
    
    subgraph Output
        REPORT[검토 리포트]
        CONTRACT[표준계약서]
    end
    
    IMG --> OCR
    OCR --> STRUCT
    STRUCT --> EDIT
    EDIT --> AI_ANALYZE
    DB --> AI_ANALYZE
    AI_ANALYZE --> RESULT
    RESULT --> REPORT
    RESULT --> CONTRACT
    
    style IMG fill:#e3f2fd
    style OCR fill:#fff9c4
    style STRUCT fill:#fff9c4
    style AI_ANALYZE fill:#fff9c4
    style DB fill:#f0f0f0
    style REPORT fill:#c8e6c9
    style CONTRACT fill:#c8e6c9
```

## 주요 컴포넌트

### Frontend Components
```
App.jsx
├── StepIndicator (진행 단계 표시)
├── Step 1: Upload (파일 선택 및 로딩 팁 표시)
├── Step 2: Structured (EditableStructureTable을 통한 정보 수정)
├── Step 3: Review (최종 확인)
├── Step 4: Result (Tooltip 및 클릭 상세 보기 적용된 결과)
└── Step 5: Contract (계약서 작성 및 데이터 보존)
```

### Backend Endpoints
```
server/index.js
├── POST /api/ocr/extract (OCR 추출)
├── POST /api/ocr/structure (구조화)
├── POST /api/analyze/contract (법률 분석)
└── POST /api/generate/contract (계약서 생성)
```

### AI Prompts
```
1. Vision Prompt (OCR)
   - 문서 디지털화 전문가
   - 모든 텍스트 정확 추출
   
2. Structure Prompt (구조화)
   - 9개 섹션 매핑
   - 미기재/판독불가 표시
   
3. Analysis Prompt (검토)
   - 적법성 검토 전문가
   - 3단계 검토 로직
   - DB 기반 근거 제시
   
4. Generation Prompt (생성)
   - 표준양식 작성
   - 위반사항 자동 보완
```

## 보안 및 성능

### 보안
- ✅ 환경변수로 API 키 관리 (.env)
- ✅ CORS 설정
- ✅ 파일 업로드 메모리 제한
- ✅ 이미지 타입 검증 (accept="image/*")

### 성능
- ⚡ 멀티파일 병렬 OCR 처리
- ⚡ 프로그레스 바로 사용자 피드백
- ⚡ 메모리 스토리지 (디스크 I/O 최소화)
- ⚡ 클라이언트 사이드 이미지 프리뷰

## 확장 가능성

### 향후 개선 가능 항목
1. **데이터베이스**: CSV → PostgreSQL/MongoDB
2. **인증**: 사용자 로그인 및 히스토리 관리
3. **캐싱**: Redis로 분석 결과 캐싱
4. **파일 저장**: S3/Cloud Storage 연동
5. **실시간**: WebSocket으로 진행 상황 스트리밍
6. **다국어**: i18n 지원
7. **모바일**: 반응형 디자인 강화
