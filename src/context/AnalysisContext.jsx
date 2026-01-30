import { createContext, useContext, useState, useRef } from 'react';

// Context 생성
const AnalysisContext = createContext(null);

// Provider 컴포넌트
export function AnalysisProvider({ children }) {
    // 파일 및 미리보기 상태
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [extractedText, setExtractedText] = useState('');

    // 분석 상태
    const [structuredData, setStructuredData] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [generatedContract, setGeneratedContract] = useState('');

    // 로딩 상태
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    // 사용자 컨텍스트
    const [userContext, setUserContext] = useState({
        businessSize: '5인이상',
        workerTypes: ['정규직']
    });

    // UI 상태
    const [step, setStep] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDB, setSelectedDB] = useState(null);

    // Refs
    const analysisResultRef = useRef(null);
    const contractRef = useRef(null);

    // 상태 초기화 함수
    const resetAnalysisState = () => {
        setFiles([]);
        setPreviewUrls([]);
        setExtractedText('');
        setStructuredData(null);
        setAnalysisResult(null);
        setGeneratedContract('');
        setStep(1);
        setIsExpanded(false);
        setProgress(0);
    };

    // 파일 관련 함수
    const handleFileSelect = (selectedFiles) => {
        setFiles(selectedFiles);

        // 기존 미리보기 정리
        if (previewUrls.length > 0) {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        }

        const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        setIsExpanded(false);
    };

    const value = {
        // 파일 상태
        files,
        setFiles,
        previewUrls,
        setPreviewUrls,
        extractedText,
        setExtractedText,
        handleFileSelect,

        // 분석 상태
        structuredData,
        setStructuredData,
        analysisResult,
        setAnalysisResult,
        generatedContract,
        setGeneratedContract,

        // 로딩 상태
        isAnalyzing,
        setIsAnalyzing,
        progress,
        setProgress,

        // 사용자 컨텍스트
        userContext,
        setUserContext,

        // UI 상태
        step,
        setStep,
        isExpanded,
        setIsExpanded,
        selectedDB,
        setSelectedDB,

        // Refs
        analysisResultRef,
        contractRef,

        // 유틸리티
        resetAnalysisState,
    };

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
}

// Custom Hook
export function useAnalysis() {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
}

export default AnalysisContext;
