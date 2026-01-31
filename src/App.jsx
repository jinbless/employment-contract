import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PromptManager from './components/admin/PromptManager';
import { exportToWord, exportToPDF } from './utils/pdfExport'; // exportToPDF is used for Contract PDF
import { contractApi } from './api/contractApi';
import { apiClient } from './utils/apiClient'; // Used for initial connection check only
import { PROGRESS_INCREMENT, PROGRESS_MAX } from './constants';
import './index.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import StepProgress from './components/layout/StepProgress';

// Page Components
import LandingPage from './pages/LandingPage';

// Analysis Steps
import Step1Upload from './components/analysis/Step1Upload';
import Step2Structure from './components/analysis/Step2Structure';
import Step3Analysis from './components/analysis/Step3Analysis';
import Step4Generation from './components/analysis/Step4Generation';

// Common & Modals
import LoadingOverlay from './components/common/LoadingOverlay';
import DBModal from './components/modals/DBModal';

function App() {
    // --- State Management ---
    const [selectedService, setSelectedService] = useState(null);
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [extractedText, setExtractedText] = useState('');
    const [structuredData, setStructuredData] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedDB, setSelectedDB] = useState(null);

    const [isAdminMode, setIsAdminMode] = useState(false);
    const [generatedContract, setGeneratedContract] = useState('');
    const [step, setStep] = useState(1); // 1: Upload, 2: Structure, 3: Analysis, 4: Contract Generation

    // User Context
    const [userContext, setUserContext] = useState({
        businessSize: '5인이상',
        workerTypes: ['정규직']
    });

    // Refs
    const analysisResultRef = useRef(null);
    const contractRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false); // For "Show More" functionality

    // --- Effects ---
    useEffect(() => {
        // Quick connection check
        apiClient.get('/tips/random')
            .then(() => setIsConnected(true))
            .catch(() => setIsConnected(false));
    }, []);

    // --- Handlers ---

    const handleAnalysisStart = (service) => {
        setSelectedService(service);
        setFiles([]);
        setPreviewUrls([]);
        setExtractedText('');
        setStructuredData(null);
        setAnalysisResult(null);
        setGeneratedContract('');
        setStep(1);
        setIsExpanded(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);

            // Cleanup old previews
            if (previewUrls.length > 0) {
                previewUrls.forEach(url => URL.revokeObjectURL(url));
            }
            const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviewUrls);
            setIsExpanded(false);
        }
    };

    const extractOCR = async () => {
        if (!isConnected) { alert('서버와 연결되어 있지 않습니다.'); return; }
        if (files.length === 0) { alert('파일을 먼저 선택해주세요.'); return; }

        setIsAnalyzing(true);
        setProgress(0);

        let combinedText = "";
        const totalFiles = files.length;
        // Camp at 90% until done
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + PROGRESS_INCREMENT, 90));
        }, 500);

        try {
            for (let i = 0; i < totalFiles; i++) {
                const fd = new FormData();
                fd.append('file', files[i]);
                console.log(`OCR 요청 중: 파일 ${i + 1}/${totalFiles}`);

                // Use new API layer
                const data = await contractApi.extractOCR(fd);
                console.log('OCR 성공:', data);

                if (data.extractedText) {
                    combinedText += `\n--- 문서 ${i + 1} ---\n` + data.extractedText + "\n";
                }
            }
            clearInterval(interval);
            setProgress(95); // Almost done
            setExtractedText(combinedText.trim());

            // Proceed to structure data
            await structureData(combinedText.trim());
        } catch (error) {
            clearInterval(interval);
            setIsAnalyzing(false);
            console.error('OCR 전체 오류:', error);
            alert('OCR 처리 중 오류가 발생했습니다.\n\n' + error.message);
        }
    };

    // Corrected `extractOCR` function above had a syntax error `constdata`. Fixing it below in the write call.

    const structureData = async (text) => {
        try {
            console.log('구조화 요청 시작');
            const data = await contractApi.structureContract(text);
            console.log('구조화 성공:', data);
            setStructuredData(JSON.parse(data.structuredData));
            setProgress(100);
            setTimeout(() => {
                setIsAnalyzing(false);
                setProgress(0);
            }, 500);
        } catch (error) {
            console.error('구조화 오류:', error);
            setIsAnalyzing(false);
            alert('구조화 중 오류가 발생했습니다.\n\n' + error.message);
        }
    };

    const confirmAndAnalyze = async () => {
        if (!structuredData) {
            alert('구조화된 데이터가 없습니다.');
            return;
        }
        setIsAnalyzing(true);
        setProgress(0); // Reset progress

        // Fake progress for analysis
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 90)); // Camp at 90%
        }, 800);

        try {
            console.log('분석 요청 시작:', structuredData, userContext);
            const data = await contractApi.analyzeContract(structuredData, userContext);
            console.log('분석 성공:', data);

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                setAnalysisResult(data);
                setIsAnalyzing(false);
                setStep(3); // Explicitly set step 3
                setProgress(0);
                setIsExpanded(false); // Reset expansion for new result
            }, 500);

        } catch (error) {
            console.error('분석 오류:', error);
            clearInterval(interval);
            setIsAnalyzing(false);
            alert('분석 중 오류가 발생했습니다.\n\n' + error.message);
        }
    };

    const generateContract = async () => {
        if (!analysisResult) return;
        setIsAnalyzing(true);
        try {
            const data = await contractApi.generateContract(analysisResult);
            if (data.success) {
                setGeneratedContract(data.contractText);
                setStep(4);
            } else {
                alert('계약서 생성 실패: ' + data.error);
            }
        } catch (error) {
            console.error('계약서 생성 오류:', error);
            alert('계약서 생성 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- Download Handlers ---

    const downloadContractPDF = async () => {
        if (!generatedContract) return;
        try {
            await exportToPDF(generatedContract, `표준근로계약서_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            alert(error.message);
        }
    };

    const downloadContractWord = () => {
        if (!generatedContract) return;
        exportToWord(generatedContract, `표준근로계약서_${new Date().toISOString().slice(0, 10)}.doc`);
    };

    const downloadAnalysisPDF = async () => {
        if (!analysisResultRef.current) return;

        try {
            // Hide buttons temporarily
            const buttons = analysisResultRef.current.querySelectorAll('button');
            buttons.forEach(btn => btn.style.display = 'none');

            const canvas = await html2canvas(analysisResultRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Restore buttons
            buttons.forEach(btn => btn.style.display = '');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`근로계약서_분석결과_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('PDF 생성 실패:', error);
            alert('PDF 생성 중 오류가 발생했습니다.');
        }
    };

    const handleReUpload = () => {
        setStructuredData(null);
        setFiles([]);
        setPreviewUrls([]);
        setStep(1);
    };

    // --- Render Logic ---

    // 1. Landing Page
    if (!selectedService) {
        return <LandingPage onSelectService={handleAnalysisStart} />;
    }

    // 2. Main Layout
    return (
        <div className="app-container">
            <Sidebar
                selectedService={selectedService}
                onSelectService={handleAnalysisStart}
                isAdminMode={isAdminMode}
                onToggleAdmin={() => setIsAdminMode(!isAdminMode)}
            />

            <div className="main-content">
                <TopHeader
                    selectedService={selectedService}
                    isConnected={isConnected}
                />

                {/* Show Step Progress unless in Admin Mode */}
                {!isAdminMode && (
                    <StepProgress
                        step={step}
                        files={files}
                        analysisResult={analysisResult}
                    />
                )}

                <div className="content-area">
                    {isAdminMode ? (
                        <PromptManager onBack={() => setIsAdminMode(false)} />
                    ) : (
                        <div>
                            {/* Step Views */}

                            {/* Step 4: Generation Phase */}
                            {step === 4 ? (
                                <Step4Generation
                                    previewUrls={previewUrls}
                                    extractedText={extractedText}
                                    generatedContract={generatedContract}
                                    onContractChange={setGeneratedContract}
                                    onDownloadWord={downloadContractWord}
                                    onDownloadPDF={downloadContractPDF}
                                    contractRef={contractRef}
                                />
                            ) : files.length === 0 ? (
                                // Step 1: Upload
                                <Step1Upload onFileChange={handleFileChange} />
                            ) : (
                                // Split View (Step 2 & 3)
                                <div className="split-view">
                                    {/* Left Panel: Document Preview */}
                                    <div className="document-panel">
                                        <div className="panel-header">
                                            <div className="panel-title">업로드된 문서</div>
                                        </div>
                                        {previewUrls.map((url, idx) => (
                                            <img key={idx} src={url} alt={`문서 ${idx + 1}`} className="document-image" />
                                        ))}
                                        {!analysisResult && (
                                            <button onClick={extractOCR} className="upload-button" style={{ marginTop: '16px', width: '100%' }}>
                                                분석 시작
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Panel: Working Area */}
                                    <div className="analysis-panel" style={{
                                        position: 'relative',
                                        height: '100%', // Take full available height
                                        maxHeight: isExpanded ? 'none' : 'calc(100vh - 140px)', // Increased default height
                                        overflowY: isExpanded ? 'visible' : 'auto', // Allow scrolling if needed inside, or hidden if we want strict Show More
                                        // User asked for "Show More" behavior, so overflow should be hidden when collapsed
                                        overflow: isExpanded ? 'visible' : 'hidden',
                                        transition: 'max-height 0.3s ease-in-out'
                                    }}>
                                        <div className="panel-header">
                                            <div className="panel-title">분석 결과</div>
                                        </div>

                                        {/* Step 2: Structure Data Confirmation */}
                                        {structuredData && !analysisResult && !isAnalyzing && (
                                            <Step2Structure
                                                structuredData={structuredData}
                                                setStructuredData={setStructuredData}
                                                userContext={userContext}
                                                setUserContext={setUserContext}
                                                onConfirm={confirmAndAnalyze}
                                                onReUpload={handleReUpload}
                                            />
                                        )}

                                        {/* Step 3: Analysis Results */}
                                        {analysisResult && (
                                            <div style={{ paddingBottom: isExpanded ? '0' : '60px' }}>
                                                <Step3Analysis
                                                    analysisResult={analysisResult}
                                                    userContext={userContext}
                                                    onDownloadPDF={downloadAnalysisPDF}
                                                    onGenerateContract={generateContract}
                                                    onSelectDB={setSelectedDB}
                                                    resultRef={analysisResultRef}
                                                />
                                            </div>
                                        )}

                                        {/* Loading State Placeholder when analyzing */}
                                        {isAnalyzing && !structuredData && !analysisResult && (
                                            // Initial OCR loading
                                            <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                                                <div className="loading-spinner"></div>
                                                <div style={{ marginTop: '16px' }}>분석 대기 중...</div>
                                            </div>
                                        )}
                                        {/* Structure -> Analysis Loading */}
                                        {isAnalyzing && structuredData && (
                                            <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                                                <div className="loading-spinner"></div>
                                                <div style={{ marginTop: '16px' }}>
                                                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>AI가 법률을 검토하고 있습니다...</div>
                                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>약 30초 정도 소요됩니다 잠시만 기다려주세요</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Initial Empty State before OCR */}
                                        {!structuredData && !analysisResult && !isAnalyzing && (
                                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-secondary)' }}>
                                                분석 시작 버튼을 클릭하세요
                                            </div>
                                        )}

                                        {/* Show More Overlay (Only for Step 3) */}
                                        {analysisResult && !isExpanded && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '150px',
                                                background: 'linear-gradient(to bottom, rgba(255,255,255,0), white 70%)',
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                paddingBottom: '20px',
                                                zIndex: 10
                                            }}>
                                                <button
                                                    onClick={() => setIsExpanded(true)}
                                                    style={{
                                                        padding: '10px 24px',
                                                        background: 'white',
                                                        border: '1px solid #d9d9d9',
                                                        borderRadius: '20px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        color: '#0056B3',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    더보기 ⬇️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modals & Overlays */}
                <LoadingOverlay isAnalyzing={isAnalyzing} progress={progress} />
                <DBModal selectedDB={selectedDB} onClose={() => setSelectedDB(null)} />
            </div>
        </div>
    );
}

export default App;
