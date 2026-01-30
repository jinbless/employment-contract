/**
 * async 핸들러를 래핑하여 에러를 next로 전달합니다.
 * @param {Function} fn - async 라우트 핸들러
 * @returns {Function} - 래핑된 핸들러
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 전역 에러 처리 미들웨어
 */
export function errorMiddleware(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다';

  console.error(`❌ [${statusCode}] ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

/**
 * 검증 에러 생성 유틸리티
 * @param {string} message - 에러 메시지
 * @returns {Error} - 400 상태 코드가 설정된 에러
 */
export function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}
