# 시스템 아키텍처 (System Architecture)

현재 개발 중인 "노동법 자율점검 AI" 서비스의 시스템 구조도입니다.

```mermaid
graph TD
    %% 스타일 정의
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef server fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef external fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,stroke-dasharray: 5 5;
    classDef data fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;

    subgraph Client [Client Side (Frontend)]
        User((User))
        Browser[React App (Vite)]:::client
        
        subgraph UI_Components [Key Components]
            UploadUI[Image Upload & Preview]:::client
            MappingUI[Editable Structure Table]:::client
            ResultUI[Analysis Result & Expert Opinion]:::client
            ContractUI[Contract Generator]:::client
        end
    end

    subgraph Server [Server Side (Backend)]
        APIServer[Node.js / Express Server]:::server
        
        subgraph API_Services [Internal Services]
            OCRService[OCR Processing Handler]:::server
            AnalysisService[Labor Law Analysis Handler]:::server
            GenService[Contract Generation Handler]:::server
        end
        
        DBFiles[(Local DB / Excel Resources)]:::data
    end

    subgraph External [External Services]
        OpenAI[OpenAI API (GPT-4o)]:::external
        LawDB[국가법령정보센터 (Link)]:::external
    end

    %% 데이터 흐름
    User -->|Upload Image| Browser
    Browser -->|POST /api/upload| APIServer
    
    APIServer -->|Extract Text| OCRService
    OCRService -->|Text Data| Browser
    
    Browser -->|Modify Mapping| UI_Components
    Browser -->|POST /api/analyze| APIServer
    
    APIServer -->|Prompt + Context| AnalysisService
    AnalysisService -.->|RAG (Retrieval)| DBFiles
    AnalysisService -->|Request Analysis| OpenAI
    OpenAI -->|Analysis Result| AnalysisService
    AnalysisService -->|JSON Response| Browser
    
    Browser -->|Display Result| ResultUI
    ResultUI -.->|Reference| LawDB
    
    Browser -->|Request Contract| APIServer
    APIServer -->|Request Generation| GenService
    GenService -->|Generate| OpenAI
    OpenAI -->|Draft Contract| GenService
    GenService -->|Download File| Browser
```

## 주요 구성 요소

### 1. Frontend (React + Vite)
- **사용자 인터페이스**: 파일 업로드, 데이터 매핑 수정, 분석 결과 확인, 계약서 다운로드 기능 제공
- **상태 관리**: `useState`를 활용한 단계별(Step-by-Step) 진행 관리 (Upload -> Structured -> Result -> Contract)
- **UI/UX**: `framer-motion`을 이용한 부드러운 전환 및 애니메이션, `lucide-react` 아이콘 활용

### 2. Backend (Node.js + Express)
- **API 서버**: 클라이언트 요청 처리 (OCR 추출, 법률 분석, 계약서 생성)
- **프롬프트 엔지니어링**: OpenAI GPT-4o에 전달할 최적화된 프롬프트 관리
- **리소스 관리**: 노동법 관련 참조 데이터(Excel 등) 관리 및 활용 (RAG 유사 방식)

### 3. External (OpenAI API)
- **GPT-4o 모델**: 
    - OCR 텍스트 구조화 및 교정
    - 근로기준법 기반 위반 사항 분석
    - 전문가 종합 의견 생성
    - 표준 근로계약서 초안 작성

## 데이터 흐름 (Workflow)
1. **업로드**: 사용자가 근로계약서 등 사진 업로드 -> 서버에서 텍스트 추출
2. **정보 매핑**: 추출된 텍스트를 사용자가 검토 및 수정 (구조화)
3. **분석**: 수정된 데이터를 바탕으로 AI가 법률 위반 여부 분석 및 전문가 의견 제시
4. **결과 및 생성**: 분석 결과 확인 후, 수정된 내용을 반영하여 새로운 표준 계약서 생성 및 다운로드
