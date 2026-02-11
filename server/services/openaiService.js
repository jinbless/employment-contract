import { OpenAI } from 'openai';
import { safeJsonParse, cleanJsonResponse } from '../utils/jsonParser.js';
import { getDetailedLegalContent } from './dataService.js';

let openaiInstance = null;
let promptsRef = null;

/**
 * 분석 카테고리 그룹 정의
 */
const ANALYSIS_GROUPS = [
  {
    id: 'basic_info',
    name: '기본정보',
    items: ['사용자 정보', '근로자 정보', '근로개시일', '근무장소', '업무내용']
  },
  {
    id: 'working_hours',
    name: '근로시간/휴일',
    items: ['소정근로시간', '휴게시간', '근무일/휴일', '연차유급휴가',
            '연장·야간·휴일근로', '근로시간 제한', '야간·휴일근로 제한',
            '근로시간 특례', '근로일 및 근로일별 근로시간']
  },
  {
    id: 'wages',
    name: '임금',
    items: ['임금', '임금 구성항목', '임금 계산방법', '임금 지급방법',
            '임금 지급시기', '일당']
  },
  {
    id: 'insurance_retirement',
    name: '사회보험/퇴직금',
    items: ['사회보험', '퇴직금', '수습기간']
  },
  {
    id: 'contract_misc',
    name: '계약체결/기타',
    items: ['근로계약서 교부', '계약서 작성일', '당사자 서명날인',
            '성실 이행의무', '기타사항', '근로계약기간',
            '연령증명서', '친권자 동의서', '체류자격', '숙식제공 여부']
  }
];

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
 * 시스템 프롬프트에서 그룹에 해당하는 매핑 테이블 행만 추출
 */
function buildGroupSystemPrompt(fullPrompt, groupItemNames) {
  const step3Start = fullPrompt.indexOf('## STEP 3:');
  const step4Start = fullPrompt.indexOf('## STEP 4:');

  if (step3Start === -1 || step4Start === -1) {
    return fullPrompt + `\n\n**[검토 범위]**\n이 요청에서는 다음 항목만 검토하세요: ${groupItemNames.join(', ')}`;
  }

  const preamble = fullPrompt.substring(0, step3Start);
  const mappingSection = fullPrompt.substring(step3Start, step4Start);
  const postamble = fullPrompt.substring(step4Start);

  // 매핑 테이블 필터링
  const lines = mappingSection.split('\n');
  const result = [];
  let headerLines = [];
  let headerEmitted = false;

  for (const line of lines) {
    if (line.startsWith('### [') || line.startsWith('## STEP 3')) {
      result.push(line);
      headerLines = [];
      headerEmitted = false;
    } else if (line.startsWith('| 항목')) {
      headerLines = [line];
    } else if (headerLines.length === 1 && line.startsWith('|---')) {
      headerLines.push(line);
    } else if (headerLines.length >= 2 && line.startsWith('|')) {
      const itemName = line.split('|')[1]?.trim();
      if (groupItemNames.includes(itemName)) {
        if (!headerEmitted) {
          result.push(...headerLines);
          headerEmitted = true;
        }
        result.push(line);
      }
    } else {
      headerLines = [];
      headerEmitted = false;
      result.push(line);
    }
  }

  const groupInstruction = `\n**[검토 범위]**\n이 요청에서는 다음 항목만 검토하세요: ${groupItemNames.join(', ')}\n위 항목 외의 항목은 검토하지 마세요.\n`;

  return preamble + groupInstruction + result.join('\n') + '\n' + postamble;
}

/**
 * 적용 항목을 그룹에 배정
 */
function assignItemsToGroups(applicableItems) {
  return ANALYSIS_GROUPS
    .map(groupDef => {
      const matchedItems = applicableItems.filter(item =>
        groupDef.items.includes(item.항목)
      );

      if (matchedItems.length === 0) return null;

      const topics = [...new Set(
        matchedItems.flatMap(item => [
          item.연관주제1, item.연관주제2, item.연관주제3,
          item.연관주제4, item.연관주제5, item.연관주제6, item.연관주제7
        ]).filter(Boolean)
      )];

      return { groupDef, items: matchedItems, topics };
    })
    .filter(Boolean);
}

/**
 * 그룹별 OpenAI 분석 호출
 */
async function performGroupAnalysis(groupDef, structuredData, userContext, guidelines, groupSystemPrompt) {
  const config = getPromptConfig('analysis');
  const { businessSize, workerTypes } = userContext;

  console.log(`  🔄 [${groupDef.name}] 분석 시작 (${groupDef.items.length}개 항목)`);
  const startTime = Date.now();

  try {
    const completion = await openaiInstance.chat.completions.create({
      model: config.model || 'gpt-5.2',
      messages: [
        { role: 'system', content: groupSystemPrompt },
        {
          role: 'user',
          content: `
[사용자 정보]
- 사업장 규모: ${businessSize}
- 근로자 유형: ${workerTypes.join(', ')}

[상세 법령 가이드라인(참고자료 DB)]
${guidelines}

[구조화된 근로계약서 데이터]
${JSON.stringify(structuredData, null, 2)}

[검토 대상 항목]
이 요청에서는 다음 항목만 검토하세요: ${groupDef.items.join(', ')}
          `
        }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 3000,
      temperature: 0
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✅ [${groupDef.name}] 완료 (${elapsed}초)`);

    return safeJsonParse(completion.choices[0].message.content, { results: [] });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`  ❌ [${groupDef.name}] 실패 (${elapsed}초):`, error.message);
    throw error;
  }
}

/**
 * 그룹 결과 병합
 */
function mergeGroupResults(settledResults, groupsWithGuidelines) {
  const allResults = [];
  const allDbRefs = {};
  const errors = [];

  settledResults.forEach((result, idx) => {
    const groupName = groupsWithGuidelines[idx].groupDef.name;

    if (result.status === 'fulfilled' && result.value?.results) {
      allResults.push(...result.value.results);
    } else if (result.status === 'rejected') {
      errors.push(groupName);
    }

    Object.assign(allDbRefs, groupsWithGuidelines[idx].dbRefs);
  });

  const hasViolation = allResults.some(r => r.적절성 === '부적절');
  const hasWarning = allResults.some(r => r.적절성 === '보완필요');
  const riskLevel = hasViolation ? '상' : hasWarning ? '중' : '하';
  const overallStatus = hasViolation ? '위험' : hasWarning ? '보완필요' : '적정';

  const violation = allResults.filter(r => r.적절성 === '부적절');
  const warning = allResults.filter(r => r.적절성 === '보완필요');

  let overallOpinion = `총 ${allResults.length}개 항목 검토 결과, `;
  if (violation.length > 0) overallOpinion += `${violation.length}개 항목에서 위반 가능성이 발견되었고, `;
  if (warning.length > 0) overallOpinion += `${warning.length}개 항목에서 보완이 필요하며, `;
  overallOpinion += `${allResults.length - violation.length - warning.length}개 항목은 적절한 것으로 판단됩니다.`;
  if (errors.length > 0) {
    overallOpinion += ` (${errors.join(', ')} 카테고리 분석이 실패하여 부분 결과입니다.)`;
  }

  let finalRecommendations = '';
  if (violation.length > 0) {
    finalRecommendations += '우선 수정 필요 항목: ' + violation.map(v => v.항목).join(', ') + '. ';
  }
  if (warning.length > 0) {
    finalRecommendations += '보완 권고 항목: ' + warning.map(w => w.항목).join(', ') + '. ';
  }
  if (violation.length === 0 && warning.length === 0) {
    finalRecommendations = '전체 항목이 적절한 것으로 확인되었습니다.';
  }

  return {
    riskLevel,
    overallStatus,
    overallOpinion,
    results: allResults,
    finalRecommendations,
    dbReferences: allDbRefs,
    _meta: {
      totalGroups: settledResults.length,
      successGroups: settledResults.filter(r => r.status === 'fulfilled').length,
      failedGroups: errors
    }
  };
}

/**
 * 병렬 분석 오케스트레이터
 */
export async function performParallelAnalysis(structuredData, userContext, applicableItems) {
  const config = getPromptConfig('analysis');
  let fullSystemPrompt = config.systemPrompt || '근로계약서를 분석하세요.';
  fullSystemPrompt = fullSystemPrompt
    .replace(/^const\s+SYSTEM_PROMPT_ANALYSIS\s*=\s*`\n?/, '')
    .replace(/`;$/, '');

  const totalStart = Date.now();

  // 1. 적용 항목을 그룹에 배정
  const groupAssignments = assignItemsToGroups(applicableItems);
  console.log(`📊 ${groupAssignments.length}개 그룹으로 분할:`,
    groupAssignments.map(g => `${g.groupDef.name}(${g.items.length})`).join(', '));

  // 2. 그룹별 법령 가이드라인 병렬 조회
  const groupsWithGuidelines = await Promise.all(
    groupAssignments.map(async (group) => {
      const guidelinesResult = await getDetailedLegalContent(group.topics);
      return { ...group, guidelines: guidelinesResult.text, dbRefs: guidelinesResult.structured };
    })
  );

  // 3. 그룹별 시스템 프롬프트 생성 + 병렬 분석 실행
  const groupResults = await Promise.allSettled(
    groupsWithGuidelines.map(group => {
      const groupPrompt = buildGroupSystemPrompt(
        fullSystemPrompt,
        group.items.map(item => item.항목)
      );
      return performGroupAnalysis(
        group.groupDef, structuredData, userContext, group.guidelines, groupPrompt
      );
    })
  );

  // 4. 결과 병합
  const result = mergeGroupResults(groupResults, groupsWithGuidelines);

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`✅ 병렬 분석 완료 (총 ${totalElapsed}초, ${result._meta.successGroups}/${result._meta.totalGroups} 그룹 성공)`);

  return result;
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
