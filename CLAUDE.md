# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI 노동법 자율점검 서비스 (AI Labor Law Self-Check Service) - A web application that analyzes Korean labor documents (employment contracts, wage slips, employment rules) using AI to check for labor law violations. Developed for the Ministry of Employment and Labor (고용노동부).

## Development Commands

```bash
# Frontend (React + Vite)
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build
npm run lint     # ESLint check

# Backend (Node.js + Express)
cd server
npm start        # Start server on port 3001
npm run dev      # Start with file watching (--watch flag)
```

Run both servers simultaneously for full development.

## Architecture

### Tech Stack
- **Frontend:** React 19 + Vite, Framer Motion, jsPDF/html2canvas (PDF export)
- **Backend:** Express.js, OpenAI API (GPT-4o for structuring, GPT-5.2 for OCR/analysis)
- **File Processing:** multer (uploads), xlsx (Excel parsing), csv-parser

### Step-Based Workflow
The app uses a 4-step state machine (`step` state in App.jsx):
```
Step 1: Upload → Step 2: Structure/Edit → Step 3: Analysis → Step 4: Contract Generation
```

### API Endpoints (server/index.js)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/ocr/extract` | Extract text from uploaded image using GPT vision |
| `POST /api/ocr/structure` | Convert raw OCR text to structured JSON |
| `POST /api/analyze` | Legal compliance analysis with RAG |
| `POST /api/generate/contract` | Generate compliant contract from analysis |
| `GET/POST /api/admin/prompts` | Manage AI prompts dynamically |
| `GET /api/admin/files` | List reference data files |

### RAG System (Legal Reference Data)
- **Excel files (`*.xlsx`)** in project root: 30+ Korean labor law reference documents
- Files indexed by category prefix (e.g., `임금_data_*.xlsx` → category "임금")
- `getDetailedLegalContent()` extracts relevant legal content by topic ID
- CSV files in `server/`: Filtered contract items by business size/worker type

### Prompt Management
`server/prompts.json` contains AI prompts for each step:
- `ocrExtraction`: Image → text extraction
- `structure`: Text → JSON structuring
- `intentClassification`: Categorize document content
- `analysis`: Legal compliance checking (main analysis prompt with detailed mapping tables)
- `generation`: Contract generation

### User Context Filtering
Analysis applies different legal requirements based on:
- `businessSize`: "5인이상" (5+ employees) or "5인미만"
- `workerTypes`: ["정규직", "기간제", "단시간", "일용직", "연소자", "외국인"]

### Key Frontend Components
- `App.jsx` - Main app with all workflow logic (large monolithic component)
- `EditableStructureTable.jsx` - Editable table for structured data review
- `PromptManager.jsx` - Admin UI for editing AI prompts
- `legalRequirements.js` - Legal requirement definitions with categories/priorities

## Environment Configuration

Backend requires `.env` in `server/` directory:
```
OPENAI_API_KEY=your_key_here
```

## Design System

See `DESIGN_SPEC.md` for complete UI/UX specifications:
- Color palette (Navy Deep #001F54, Blue Primary #0056B3)
- Pretendard font family
- Status colors: Success #22C55E, Warning #F59E0B, Danger #EF4444
