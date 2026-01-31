# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI 노동법 자율점검 서비스 (AI Labor Law Self-Check Service) - A web application that analyzes Korean labor documents (employment contracts, wage slips, employment rules) using AI to check for labor law violations. Developed for the Ministry of Employment and Labor (고용노동부).

## Development Commands

```bash
# Frontend (React + Vite) - from project root
npm run dev      # Start dev server at http://localhost:5173 (proxies /api to backend)
npm run build    # Production build to dist/
npm run lint     # ESLint check

# Backend (Node.js + Express) - from server/ directory
cd server
npm start        # Start server on port 3001
npm run dev      # Start with file watching (--watch flag)
```

Run both servers simultaneously for full development. Frontend proxies `/api` requests to the backend.

## Architecture

### Tech Stack
- **Frontend:** React 19 + Vite, Framer Motion, jsPDF/html2canvas (PDF export), Lucide React icons
- **Backend:** Express.js, OpenAI API (models configured in `server/prompts.json`)
- **File Processing:** multer (uploads), xlsx (Excel parsing)

### Step-Based Workflow
The app uses a 4-step state machine (`step` state in App.jsx):
```
Step 1: Upload → Step 2: Structure/Edit → Step 3: Analysis → Step 4: Contract Generation
```

### Backend Structure
The server follows a modular architecture:
- `server/index.js` - Entry point, middleware setup, service initialization
- `server/routes/` - API route handlers (admin.js, analysis.js, ocr.js, tips.js)
- `server/services/` - Business logic (dataService.js, openaiService.js)
- `server/utils/` - Utilities (errorHandler.js, jsonParser.js)

### API Endpoints
| Endpoint | Route File | Purpose |
|----------|------------|---------|
| `POST /api/ocr/extract` | ocr.js | Extract text from uploaded image using GPT vision |
| `POST /api/ocr/structure` | ocr.js | Convert raw OCR text to structured JSON |
| `POST /api/analyze` | analysis.js | Legal compliance analysis with RAG |
| `POST /api/generate/contract` | analysis.js | Generate compliant contract from analysis |
| `GET/POST /api/admin/prompts` | admin.js | Manage AI prompts dynamically |
| `GET /api/admin/files` | admin.js | List reference data files |
| `GET /api/tips/random` | tips.js | Get random labor law tips |

### RAG System (Legal Reference Data)
**Excel files** in `data/legal/` contain 30+ Korean labor law reference documents organized by category:
- Files indexed by category prefix (e.g., `임금_data_*.xlsx` → category "임금")
- `dataService.getDetailedLegalContent()` extracts relevant legal content by topic ID
- Aliases defined for related categories (임금대장 → 임금명세서, 휴일대체 → 휴일)

**CSV files** in `data/templates/` define contract items filtered by business size/worker type:
- `근로계약서_updated.csv` - Employment contract items
- `임금명세서_updated.csv` - Wage slip items
- `취업규칙_updated.csv` - Employment rules items

### Prompt Management
`server/prompts.json` contains AI prompts for each step (editable via admin UI):
- `ocrExtraction`: Image → text extraction
- `structure`: Text → JSON structuring
- `intentClassification`: Categorize document content
- `analysis`: Legal compliance checking (main analysis prompt with detailed mapping tables)
- `generation`: Contract generation

Each prompt config includes: `systemPrompt`, `model`, `temperature`

### User Context Filtering
Analysis applies different legal requirements based on:
- `businessSize`: "5인이상" (5+ employees) or "5인미만" (under 5 employees)
- `workerTypes`: ["정규직", "기간제", "단시간", "일용직", "연소자", "외국인"]

### Frontend Structure
- `src/App.jsx` - Main app with workflow orchestration
- `src/components/analysis/` - Step components (Step1Upload, Step2Structure, Step3Analysis, Step4Generation)
- `src/components/layout/` - Layout components (Sidebar, TopHeader, StepProgress)
- `src/components/common/` - Shared components (LoadingOverlay)
- `src/components/modals/` - Modal dialogs (DBModal)
- `src/api/contractApi.js` - API client for contract operations
- `src/utils/` - Utilities (apiClient.js, pdfExport.js)

## Environment Configuration

Backend requires `.env` in `server/` directory:
```
OPENAI_API_KEY=your_key_here
```

## Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d --build

# Or build manually
docker build -t employment-contract .
docker run -p 3002:3002 -v ./server/.env:/app/server/.env:ro employment-contract
```

Production runs on port 3002 and serves the built frontend at `/contract/`.

## Design System

See `DESIGN_SPEC.md` for complete UI/UX specifications:
- Color palette (Navy Deep #001F54, Blue Primary #0056B3)
- Pretendard font family
- Status colors: Success #22C55E, Warning #F59E0B, Danger #EF4444
