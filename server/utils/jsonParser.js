/**
 * JSON 응답에서 마크다운 코드블록을 제거합니다.
 * @param {string} content - 원본 문자열
 * @returns {string} - 정제된 문자열
 */
export function cleanJsonResponse(content) {
  return content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * 안전하게 JSON을 파싱합니다. 실패 시 fallback 값을 반환합니다.
 * @param {string} content - JSON 문자열
 * @param {*} fallback - 파싱 실패 시 반환할 기본값
 * @returns {*} - 파싱된 객체 또는 fallback
 */
export function safeJsonParse(content, fallback = null) {
  if (!content) return fallback;

  let cleaned = cleanJsonResponse(content);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('JSON 파싱 첫 번째 시도 실패:', e.message);

    // trailing comma 제거 시도
    const fixed = cleaned
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .trim();

    try {
      return JSON.parse(fixed);
    } catch (secondError) {
      console.error('JSON 파싱 최종 실패:', secondError.message);
      return fallback;
    }
  }
}
