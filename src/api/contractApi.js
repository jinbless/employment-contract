import { apiClient, handleApiResponse } from '../utils/apiClient';

export const contractApi = {
    /**
     * Upload files for OCR extraction
     * @param {FormData} formData - FormData containing 'file'
     * @returns {Promise<Object>} - OCR result
     */
    extractOCR: async (formData) => {
        const res = await apiClient.postForm('/api/ocr/extract', formData);
        return handleApiResponse(res, 'OCR Extraction');
    },

    /**
     * Structure raw OCR text into JSON
     * @param {string} extractedText - Raw text from OCR
     * @returns {Promise<Object>} - Structured data
     */
    structureContract: async (extractedText) => {
        const res = await apiClient.post('/api/ocr/structure', { extractedText });
        return handleApiResponse(res, 'Structuring Data');
    },

    /**
     * Analyze compliance of structured contract
     * @param {Object} structuredData - The structured JSON contract
     * @param {Object} userContext - Context like business size, worker type
     * @returns {Promise<Object>} - Analysis result
     */
    analyzeContract: async (structuredData, userContext) => {
        const res = await apiClient.post('/api/analyze', {
            structuredData,
            userContext
        });
        return handleApiResponse(res, 'Contract Analysis');
    },

    /**
     * Generate a compliant standard labor contract
     * @param {Object} analysisResult - The result from analysis step
     * @returns {Promise<Object>} - Generated contract text
     */
    generateContract: async (analysisResult) => {
        const res = await apiClient.post('/api/generate/contract', { analysisResult });
        return handleApiResponse(res, 'Contract Generation');
    }
};
