import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { readFile, writeFile, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import XLSX from 'xlsx';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const ext = file.originalname.split('.').pop().toLowerCase();
            // CSV goes to /server, XLSX goes to / (root) as per existing logic
            if (ext === 'csv') {
                cb(null, __dirname);
            } else {
                cb(null, join(__dirname, '..'));
            }
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
});

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 프롬프트 로드 및 관리
let dynamicPrompts = {};
const PROMPTS_FILE = join(__dirname, 'prompts.json');

async function initPrompts() {
    try {
        const data = await readFile(PROMPTS_FILE, 'utf-8');
        dynamicPrompts = JSON.parse(data);
        console.log('✅ 프롬프트 데이터 로드 완료');
    } catch (error) {
        console.error('❌ 프롬프트 로드 실패, 기본값 확인 필요:', error);
    }
}
await initPrompts();

// 관리자: 프롬프트 조회
app.get('/api/admin/prompts', (req, res) => {
    res.json(dynamicPrompts);
});

// 관리자: 프롬프트 수정
app.post('/api/admin/prompts', async (req, res) => {
    try {
        dynamicPrompts = req.body;
        await writeFile(PROMPTS_FILE, JSON.stringify(dynamicPrompts, null, 2), 'utf-8');
        res.json({ success: true, message: '프롬프트가 저장되었습니다.' });
    } catch (error) {
        console.error('프롬프트 저장 오류:', error);
        res.status(500).json({ error: '프롬프트 저장 중 오류가 발생했습니다.' });
    }
});

// 관리자: 데이터베이스 파일 목록
app.get('/api/admin/files', async (req, res) => {
    try {
        const rootDir = join(__dirname, '..');
        const rootFiles = await readdir(rootDir);
        const serverFiles = await readdir(__dirname);

        const dbFiles = [
            ...rootFiles.filter(f => f.endsWith('.xlsx')).map(f => ({ name: f, type: 'xlsx', location: 'root' })),
            ...serverFiles.filter(f => f.endsWith('.csv')).map(f => ({ name: f, type: 'csv', location: 'server' }))
        ];

        res.json(dbFiles);
    } catch (error) {
        res.status(500).json({ error: '파일 목록 조회 실패' });
    }
});

// 관리자: 파일 업로드
app.post('/api/admin/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    // 캐시 초기화 (새 파일이 올라오면 이전 데이터 무효화)
    excelCache.clear();
    console.log(`파일 업로드 완료: ${req.file.originalname}`);
    res.json({ success: true, filename: req.file.originalname });
});

// 관리자: 파일 삭제
app.delete('/api/admin/files/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const ext = filename.split('.').pop().toLowerCase();
        const targetPath = ext === 'csv'
            ? join(__dirname, filename)
            : join(__dirname, '..', filename);

        await unlink(targetPath);
        excelCache.clear();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '파일 삭제 실패' });
    }
});

// 랜덤 팁 생성 API
app.get('/api/tips/random', async (req, res) => {
    try {
        console.log('🎲 새로운 팁 생성 요청 수신');
        const rootDir = join(__dirname, '..');
        const files = await readdir(rootDir);
        const xlsxFiles = files.filter(f => f.endsWith('.xlsx'));

        if (xlsxFiles.length === 0) {
            console.log('⚠️ 엑셀 파일 없음, 기본 팁 반환');
            return res.json({ tip: "💡 근로계약서는 근로 시작 전에 작성해야 해요" });
        }

        const randomFile = xlsxFiles[Math.floor(Math.random() * xlsxFiles.length)];
        console.log(`파일 선택: ${randomFile}`);
        const filePath = join(rootDir, randomFile);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            console.log('⚠️ 시트에 데이터 없음, 기본 팁 반환');
            return res.json({ tip: "💡 2026년 최저시급은 10,320원이에요" });
        }

        const randomRow = data[Math.floor(Math.random() * data.length)];
        const content = JSON.stringify(randomRow);
        console.log('LLM에 팁 생성 요청 중...');

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "당신은 노동법 전문가입니다. 제공된 데이터(JSON)에서 핵심적인 노동법 지식을 하나 추출하여, 일반 국민들이 이해하기 쉽고 친절한 '노동법 꿀팁' 문장으로 만들어주세요. 문장은 반드시 한 문장으로, '💡' 이모지로 시작하며, 해요체(~해요, ~법이에요)를 사용하세요. 가급적 짧고 명확하게 작성하세요."
                },
                {
                    role: "user",
                    content: `데이터: ${content}`
                }
            ],
            max_tokens: 100,
            temperature: 0.7
        });

        const tip = completion.choices[0].message.content.trim();
        console.log(`✅ 생성된 팁: ${tip}`);
        res.json({ tip });
    } catch (error) {
        console.error('❌ 팁 생성 오류:', error);
        res.json({ tip: "💡 근로계약서를 작성하면 사장님과 알바생 모두 안심할 수 있어요" });
    }
});

// AI.MOEL.GO.KR 상담 API
app.post('/api/consult/ai-moel', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: '질문이 필요합니다.' });
    }

    let browser;
    try {
        console.log('🤖 AI.MOEL.GO.KR 상담 시작:', question);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // 1. Navigate to chat page
        await page.goto('https://ai.moel.go.kr/llc/labor-law-chat', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 2. Handle consent modal
        try {
            await page.waitForSelector('input#agreeAll', { timeout: 5000 });
            await page.click('input#agreeAll');
            await page.click('button.btn-primary');
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.log('동의 모달 없음 또는 이미 동의됨');
        }

        // 3. Type question
        await page.waitForSelector('textarea', { timeout: 10000 });

        // Use React-compatible method to set value
        await page.evaluate((text) => {
            const textarea = document.querySelector('textarea');
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
            ).set;
            nativeInputValueSetter.call(textarea, text);
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }, question);

        await new Promise(r => setTimeout(r, 500));

        // 4. Click send button (NOT Enter!)
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const sendBtn = buttons.find(b =>
                b.querySelector('svg') ||
                b.classList.contains('bg-primary') ||
                b.closest('.chat-input-btn-box')
            );
            if (sendBtn) sendBtn.click();
        });

        // 5. Wait for AI response
        console.log('AI 응답 대기 중...');
        await new Promise(r => setTimeout(r, 10000)); // 10초 대기

        // 6. Extract response
        const response = await page.evaluate(() => {
            const chatBoard = document.querySelector('.chat-board-view');
            if (!chatBoard) return null;

            // Find the last AI response
            const messages = Array.from(chatBoard.querySelectorAll('.chat-message'));
            const aiMessages = messages.filter(msg =>
                msg.textContent.includes('AI 노동법 상담 도우미') ||
                msg.querySelector('.ai-response')
            );

            if (aiMessages.length > 0) {
                const lastAiMsg = aiMessages[aiMessages.length - 1];
                // Extract text content, removing badges and metadata
                const textContent = lastAiMsg.textContent
                    .replace(/AI 노동법 상담 도우미/g, '')
                    .replace(/법|질/g, '')
                    .trim();
                return textContent;
            }

            return null;
        });

        await browser.close();

        if (response) {
            console.log('✅ AI 응답 수신 완료');
            res.json({ answer: response });
        } else {
            console.log('⚠️ 응답을 찾을 수 없음');
            res.status(500).json({ error: 'AI 응답을 찾을 수 없습니다.' });
        }

    } catch (error) {
        console.error('❌ AI.MOEL.GO.KR 상담 실패:', error);
        if (browser) await browser.close();
        res.status(500).json({ error: 'AI 상담 중 오류가 발생했습니다.' });
    }
});

// 헬스체크용 루트 라우트
app.get('/', (req, res) => res.send('Labor Law Checker Backend is Running!'));

// CSV 로드 유틸리티
async function loadCSVData(filename) {
    try {
        const filePath = join(__dirname, filename);
        const data = await readFile(filePath, 'utf-8');
        const lines = data.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] || '';
            });
            return obj;
        });
    } catch (error) {
        console.error(`${filename} 로드 실패:`, error);
        return [];
    }
}

// Excel 로드 유틸리티 (캐시 적용)
const excelCache = new Map();
async function loadExcelData(keyword) {
    if (excelCache.has(keyword)) return excelCache.get(keyword);

    try {
        const rootDir = join(__dirname, '..');
        const files = await readdir(rootDir);
        // 키워드로 시작하는 .xlsx 파일 찾기
        const targetFile = files.find(f => f.startsWith(keyword) && f.endsWith('.xlsx'));

        if (!targetFile) {
            excelCache.set(keyword, "");
            return "";
        }

        const filePath = join(rootDir, targetFile);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // '내용' 섹션만 추출하여 병합
        const content = data.map(row => row['내용']).filter(Boolean).join('\n').substring(0, 2000); // 토큰 절약을 위해 2000자로 제한
        excelCache.set(keyword, content);
        return content;
    } catch (error) {
        console.error(`${keyword} Excel 로드 실패:`, error);
        return "";
    }
}

// 1. OCR 추출 API
app.post('/api/ocr/extract', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

        let base64Image;
        if (req.file.buffer) {
            base64Image = req.file.buffer.toString('base64');
        } else {
            const fileData = await readFile(req.file.path);
            base64Image = fileData.toString('base64');
        }
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const completion = await openai.chat.completions.create({
            model: dynamicPrompts.ocrExtraction.model || "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: dynamicPrompts.ocrExtraction.systemPrompt
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "이 근로계약서 이미지의 모든 텍스트를 추출해주세요." },
                        { type: "image_url", image_url: { url: `data:${req.file.mimetype};base64,${base64Image}`, detail: "high" } }
                    ]
                }
            ],
            max_tokens: 4000,
            temperature: dynamicPrompts.ocrExtraction.temperature ?? 0
        });

        res.json({ success: true, extractedText: completion.choices[0].message.content });
    } catch (error) {
        console.error('❌ OCR 추출 중 치명적 오류 발생:', error);
        res.status(500).json({ error: 'OCR 인식 중 오류가 발생했습니다. (API 오류)' });
    }
});

// 1-2. OCR 구조화 API
app.post('/api/ocr/structure', async (req, res) => {
    try {
        const { extractedText } = req.body;
        if (!extractedText) return res.status(400).json({ error: '추출된 텍스트가 없습니다.' });

        const completion = await openai.chat.completions.create({
            model: dynamicPrompts.structure.model || "gpt-4o",
            messages: [
                { role: "system", content: dynamicPrompts.structure.systemPrompt },
                { role: "user", content: `다음 OCR 텍스트를 위 양식에 맞춰 구조화해주세요:\n\n${extractedText}` }
            ],
            max_tokens: 3000,
            temperature: dynamicPrompts.structure.temperature ?? 0
        });

        // 마크다운 코드 블록 제거 (```json ... ``` 형식)
        let cleanedData = completion.choices[0].message.content.trim();
        cleanedData = cleanedData.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        cleanedData = cleanedData.replace(/^```\s*/i, '').replace(/\s*```$/, '');

        res.json({ success: true, structuredData: cleanedData });
    } catch (error) {
        console.error('구조화 오류:', error);
        res.status(500).json({ error: '구조화 중 오류 발생' });
    }
});

// 2. 법률 분석 API
const SYSTEM_PROMPT_ANALYSIS = `
당신은 근로계약서 법 위반 검토 챗봇으로서, 사용자가 제공한 근로계약서를 분석하여 필수기재사항 누락 및 위법 조항을 검토합니다.

**[Persona]**
- 근로계약서 적법성 검토 전문가
- 부드럽고 조언하는 어조 사용 ("~하시면 좋겠어요", "~권장드려요", "~확인해보세요")
- 판단이 아닌 검토의견 제공
- 참고자료 DB 범위 내에서만 근거 제시

**[검토 로직]**

## STEP 1: 적용조건 분류
사업장 규모(5인 이상/미만), 근로자 유형(정규직/기간제/단시간/일용직), 특수 조건(연소자/외국인) 파악

## STEP 2: 서면명시의무 기준 적용

### 모든 근로자 공통 - 반드시 서면 명시 + 교부 (필수_서면교부)
1) 임금의 구성항목, 계산방법, 지급방법
2) 소정근로시간
3) 주휴일, 공휴일
4) 연차유급휴가

→ 위 4개 항목 누락 시: "서면 명시 및 교부 의무 위반 가능성"

### 모든 근로자 공통 - 명시 필요, 구두 가능 (필수_명시)
5) 취업의 장소, 종사 업무
6) 취업규칙의 필수기재사항 (근로기준법 제93조 각호)
7) 사업장 부속 기숙사에 근무하게 할 경우 기숙사 규칙에서 정한 사항

→ 위 항목 누락 시: "명시 권고 (구두 가능)"

### 기간제·단시간 근로자 추가 - 반드시 서면 명시 (기간제_필수, 단시간_필수)
1) 임금 (구성항목, 계산방법, 지급방법)
2) 근로시간, 휴게에 관한 사항
3) 휴일, 휴가
4) 취업장소와 종사업무
5) 근로계약기간
6) 근로일 및 근로일별 근로시간 (단시간만)

### 계약서 교부 의무
- 근로계약서는 2부 작성하여 1부는 근로자에게 교부
- 근로계약서는 근로를 개시하기 전에 작성
- 1)~4)의 근로조건이 변경되는 경우에도 반드시 서면으로 명시, 교부

## STEP 3: 항목별 검토 수행
- 누락 여부: 항목 미기재 시 연관 DB 근거 제시
- 위법 여부: 기재 내용이 DB 기준 위반 시 검토 의견 제시

**[출력 JSON 포맷 (필수)]**
반드시 다음 JSON 형식을 유지해야 합니다:
{
  "riskLevel": "상/중/하", 
  "overallStatus": "위험/보완필요/적정",
  "overallOpinion": "### 📋 검토 결과 요약 등을 포함한 전반적인 총평",
  "results": [
    {
      "항목": "항목명",
      "적용조건": "공통/5인이상/기간제/단시간 등",
      "서면명시의무": "필수_서면교부/필수_명시/단시간_필수/기간제_필수",
      "적절성": "적절/부적절/보완필요",
      "판단이유": "검토 의견 (예: ~위반 가능성이 있습니다)",
      "발견내용": "계약서에서 발견된 실제 문구 (누락 시 '없음')",
      "법적근거": "근로기준법 제17조 등 (콤마로 구분)",
      "개선권고": "개선 방향 제언"
    }
  ],
  "suggestedContract": "고용노동부 표준양식에 기반하되 검토 의견이 반영된 수정 제안 (HTML 형식)",
  "finalRecommendations": "종합 개선 권고"
}

**중요**: 모든 답변은 한국어로 작성하세요.`;

app.post('/api/analyze/contract', async (req, res) => {
    try {
        const { workerType, companySize, manualText, serviceType = 'contract' } = req.body;

        let csvFile = '근로계약서_updated.csv';
        if (serviceType === 'rule') csvFile = '취업규칙_updated.csv';
        else if (serviceType === 'salary') csvFile = '임금명세서_updated.csv';

        const csvData = await loadCSVData(csvFile);

        // 1. 모든 CSV 행에서 고유한 연관 주제 키워드 수집
        const allKeywords = new Set();
        csvData.forEach(row => {
            [row.연관주제1, row.연관주제2, row.연관주제3, row.연관주제4, row.연관주제5, row.연관주제6, row.연관주제7]
                .filter(Boolean)
                .forEach(k => allKeywords.add(k.split(' ')[0]));
        });

        // 2. 키워드별 상세 Excel 데이터 1회씩 로드
        const excelContents = await Promise.all(
            Array.from(allKeywords).map(async k => {
                const content = await loadExcelData(k);
                return content ? `[상세: ${k}]\n${content}` : '';
            })
        );
        const detailDB = excelContents.filter(Boolean).join('\n\n---\n\n');

        // 3. CSV 기준 데이터 요약
        const baseDB = csvData.map(row =>
            `항목: ${row.항목}\n기준: ${row.기재내용}\n필요이유: ${row.필요이유}\n법령: ${row.관련법령1 || ''} ${row.관련법령2 || ''}`.trim()
        ).join('\n\n');

        const completion = await openai.chat.completions.create({
            model: dynamicPrompts.analysis.model || "gpt-4o",
            messages: [
                { role: "system", content: dynamicPrompts.analysis.systemPrompt },
                {
                    role: "user",
                    content: `[분석 조건]\n규모: ${companySize === '5more' ? '5인 이상' : '5인 미만'}, 유형: ${workerType}\n\n[계약서 전문]\n${manualText}\n\n[참조 DB 1: 기본 지침]\n${baseDB}\n\n[참조 DB 2: 상세 법령 및 판례]\n${detailDB}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: dynamicPrompts.analysis.temperature ?? 0
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (error) {
        console.error('분석 오류:', error);
        res.status(500).json({ error: '분석 중 오류 발생' });
    }
});

// 3. 근로계약서 생성 API
app.post('/api/generate/contract', async (req, res) => {
    try {
        const { analysisResult, originalText, workerType, companySize } = req.body;

        const finalPrompt = dynamicPrompts.generation.systemPrompt
            .replace('{originalText}', originalText)
            .replace('{analysisResult}', JSON.stringify(analysisResult.results))
            .replace('{finalRecommendations}', analysisResult.finalRecommendations);

        const completion = await openai.chat.completions.create({
            model: dynamicPrompts.generation.model || "gpt-4o",
            messages: [
                { role: "system", content: finalPrompt },
                { role: "user", content: "위 분석 결과를 바탕으로 완벽한 표준근로계약서를 작성해주세요." }
            ],
            temperature: dynamicPrompts.generation.temperature ?? 0
        });

        res.json({ contractText: completion.choices[0].message.content });
    } catch (error) {
        console.error('계약서 생성 오류:', error);
        res.status(500).json({ error: '계약서 생성 중 오류 발생' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
