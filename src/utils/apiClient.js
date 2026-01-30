// 환경에 따른 API 베이스 URL 설정
const API_BASE_URL = import.meta.env.PROD
  ? '/contract/api'  // 프로덕션: nginx가 프록시
  : 'http://localhost:3001';  // 개발: 로컬 서버

export const apiClient = {
  get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`),

  post: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  postForm: (endpoint, formData) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData
  }),

  delete: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE'
  })
};

export const handleApiResponse = async (res, context) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: '알 수 없는 오류' }));
    throw new Error(`${context} 실패: ${errorData.error || res.statusText}\n${errorData.details || ''}`);
  }
  return res.json();
};

export default apiClient;
