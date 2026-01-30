const API_BASE_URL = 'http://localhost:3001';

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
