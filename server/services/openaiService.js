import { OpenAI } from 'openai';
import { safeJsonParse, cleanJsonResponse } from '../utils/jsonParser.js';

let openaiInstance = null;
let promptsRef = null;

/**
 * OpenAI 서비스 초기화
 */
export function initOpenAI(apiKey, prompts) {
  openaiInstance = new OpenAI({ apiKey: apiKey?.trim() });
  promptsRef = prompts;
}

/**
 * 프롬프트 참조 업데이트
 */
export function updatePrompts(prompts) {
  promptsRef = prompts;
}

/**
 * 프롬프트 설정 가져오기
 */
function getPromptConfig(promptKey) {
  return promptsRef?.[promptKey] || {};
}

/**
 * 이미지에서 텍스트 추출 (OCR)
 */
export async function extractTextFromImage(base64Image) {
  const config = getPromptConfig('ocrExtraction');
  console.log('🔍 OCR 추출 시작...');
  console.log('  - 모델:', config.model || 'gpt-5.2');
  console.log('  - 이미지 크기:', Math.round(base64Image.length / 1024), 'KB');

  try {
    const completion = await openaiInstance.chat.completions.create({
      model: config.model || 'gpt-5.2',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: config.systemPrompt || '이미지에서 텍스트를 추출하세요.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }],
      max_completion_tokens: 2000,
      temperature: config.temperature ?? 0
    });

    console.log('✅ OCR API 응답 성공');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ OCR API 에러:', error.message);
    console.error('  - 에러 타입:', error.constructor.name);
    console.error('  - 상태 코드:', error.status || 'N/A');
    console.error('  - 에러 코드:', error.code || 'N/A');
    if (error.error) {
      console.error('  - 상세:', JSON.stringify(error.error, null, 2));
    }
    throw error;
  }
}

/**
 * 텍스트를 구조화된 JSON으로 변환
 */
export async function structureText(extractedText) {
  const config = getPromptConfig('structure');
  console.log('🔍 텍스트 구조화 시작...');
  console.log('  - 모델:', config.model || 'gpt-5.2');
  console.log('  - 입력 텍스트 길이:', extractedText?.length || 0, '자');

  try {
    const completion = await openaiInstance.chat.completions.create({
      model: config.model || 'gpt-5.2',
      messages: [
        { role: 'system', content: config.systemPrompt || '텍스트를 JSON으로 구조화하세요.' },
        { role: 'user', content: `다음 OCR 텍스트를 위 양식에 맞춰 구조화해주세요:\n\n${extractedText}` }
      ],
      max_completion_tokens: 3000,
      temperature: config.temperature ?? 0
    });

    console.log('✅ 구조화 API 응답 성공');
    return cleanJsonResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ 구조화 API 에러:', error.message);
    console.error('  - 에러 타입:', error.constructor.name);
    console.error('  - 상태 코드:', error.status || 'N/A');
    console.error('  - 에러 코드:', error.code || 'N/A');
    if (error.error) {
      console.error('  - 상세:', JSON.stringify(error.error, null, 2));
    }
    throw error;
  }
}

/**
 * 의도 분류
 */
export async function classifyIntent(structuredData) {
  const config = getPromptConfig('intentClassification');
  const defaultResult = { categories: [], primaryCategory: '기타', needsReview: [] };

  try {
    const completion = await openaiInstance.chat.completions.create({
      model: config.model || 'gpt-5.2',
      messages: [
        { role: 'system', content: config.systemPrompt || '의도를 분류하세요.' },
        { role: 'user', content: JSON.stringify(structuredData, null, 2) }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 500,
      temperature: 0
    });

    return safeJsonParse(completion.choices[0].message.content, defaultResult);
  } catch (error) {
    console.warn('⚠️ 의도 분류 실패, 기본값 사용:', error.message);
    return defaultResult;
  }
}

/**
 * 법적 분석 수행
 */
export async function performLegalAnalysis(structuredData, userContext, legalGuidelines) {
  const config = getPromptConfig('analysis');
  const { businessSize, workerTypes } = userContext;

  // prompts.json의 analysis.systemPrompt에서 JavaScript 코드 형식 제거
  let systemPrompt = config.systemPrompt || '근로계약서를 분석하세요.';
  systemPrompt = systemPrompt
    .replace(/^const\s+SYSTEM_PROMPT_ANALYSIS\s*=\s*`\n?/, '')
    .replace(/`;$/, '');

  const completion = await openaiInstance.chat.completions.create({
    model: config.model || 'gpt-5.2',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `
[사용자 정보]
- 사업장 규모: ${businessSize}
- 근로자 유형: ${workerTypes.join(', ')}

[상세 법령 가이드라인(참고자료 DB)]
${legalGuidelines}

[구조화된 근로계약서 데이터]
${JSON.stringify(structuredData, null, 2)}
        `
      }
    ],
    response_format: { type: 'json_object' },
    max_completion_tokens: 8000,
    temperature: 0
  });

  const defaultResult = {
    riskLevel: '중',
    overallStatus: '보완필요',
    overallOpinion: '분석 중 오류가 발생했습니다.',
    results: [],
    finalRecommendations: '시스템 오류로 인해 분석을 완료하지 못했습니다. 다시 시도해주세요.'
  };

  return safeJsonParse(completion.choices[0].message.content, defaultResult);
}

/**
 * 표준 근로계약서 생성
 */
export async function generateLegalContract(analysisResult) {
  const config = getPromptConfig('generation');

  const completion = await openaiInstance.chat.completions.create({
    model: config.model || 'gpt-5.2',
    messages: [
      { role: 'system', content: config.systemPrompt || '표준 근로계약서를 생성하세요.' },
      { role: 'user', content: `다음 분석 결과를 바탕으로 완벽한 표준근로계약서를 작성해주세요:\n\n${JSON.stringify(analysisResult, null, 2)}` }
    ],
    max_completion_tokens: 4000,
    temperature: config.temperature ?? 0
  });

  return completion.choices[0].message.content;
}

/**
 * 노동법 꿀팁 생성
 */
export async function generateLaborLawTip(dataRow) {
  try {
    const completion = await openaiInstance.chat.completions.create({
      model: 'gpt-4o', // Lightweight for tips
      messages: [
        {
          role: 'system',
          content: "당신은 노동법 전문가입니다. 제공된 데이터에서 핵심적인 노동법 지식을 하나 추출하여, 일반 국민들이 이해하기 쉽고 친절한 '노동법 꿀팁' 문장으로 만들어주세요. 문장은 반드시 한 문장으로, '💡' 이모지로 시작하며, 해요체(~해요, ~법이에요)를 사용하세요. 가급적 짧고 명확하게 작성하세요."
        },
        {
          role: 'user',
          content: `데이터: ${JSON.stringify(dataRow)}`
        }
      ],
      max_completion_tokens: 100,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('팁 생성 AI 오류:', error);
    return `💡 AI 오류 발생: ${error.message}`;
  }
}
