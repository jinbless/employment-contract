import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, XCircle, Search, Scale, SlidersHorizontal, ChevronDown, ExternalLink, Edit3, Check, MousePointer2, Download, Settings, X } from 'lucide-react';
import EditableStructureTable from './EditableStructureTable';
import Tooltip from './Tooltip';
import { legalRequirements } from './legalRequirements';
import { getRandomTip } from './loadingTips';
import PromptManager from './PromptManager';

// --- Sub-components ---

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: 'upload', label: '1. 사진 업로드', icon: Upload },
        { id: 'structured', label: '2. 정보 매핑', icon: FileText },
        { id: 'result', label: '3. 결과 분석', icon: ShieldCheck },
        { id: 'contract', label: '4. 계약서 작성', icon: FileText },
    ];

    const currentIdx = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="step-container">
            {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentIdx;
                const isCompleted = idx < currentIdx;

                return (
                    <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                        <div className="step-icon-box">
                            {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                        </div>
                        <span className="step-label">{step.label}</span>
                        <div className="step-line" />
                    </div>
                );
            })}
        </div>
    );
};

// --- Main App ---

const App = () => {
    const [selectedService, setSelectedService] = useState(null);
    const [files, setFiles] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [companySize, setCompanySize] = useState("5more");
    const [workerType, setWorkerType] = useState("regular");
    const [currentStep, setCurrentStep] = useState('upload');
    const [extractedText, setExtractedText] = useState("");
    const [structuredData, setStructuredData] = useState("");
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContract, setGeneratedContract] = useState(null);
    const [currentTip, setCurrentTip] = useState(getRandomTip());
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isConnected, setIsConnected] = useState(true); // Default to true, then check

    // Heartbeat check for backend connection
    const checkConnection = async () => {
        try {
            const res = await fetch('http://localhost:3001/', { method: 'GET', signal: AbortSignal.timeout(3000) });
            setIsConnected(res.ok);
        } catch (err) {
            setIsConnected(false);
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAnalyzing) {
            const fetchTip = async () => {
                try {
                    const res = await fetch('http://localhost:3001/api/tips/random');
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentTip(data.tip);
                    } else {
                        setCurrentTip(getRandomTip());
                    }
                } catch (err) {
                    setCurrentTip(getRandomTip());
                }
            };

            fetchTip(); // Initial fetch
            const tipInterval = setInterval(fetchTip, 5000);
            return () => clearInterval(tipInterval);
        }
    }, [isAnalyzing]);

    const getRequirementMatch = (itemName) => {
        if (!itemName) return null;
        if (legalRequirements[itemName]) return legalRequirements[itemName];
        const keys = Object.keys(legalRequirements);
        const match = keys.find(key => itemName.includes(key) || key.includes(itemName));
        return match ? legalRequirements[match] : null;
    };

    const getCharImage = (svc) => {
        if (svc === 'contract') return '/contract_char.png';
        if (svc === 'rule') return '/rule_char.png';
        if (svc === 'salary') return '/salary_char.png';
        return null;
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
            if (previewUrls.length > 0) {
                previewUrls.forEach(url => URL.revokeObjectURL(url));
            }
            const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviewUrls);
        }
    };

    const extractOCR = async () => {
        if (!isConnected) { alert('서버와 연결되어 있지 않습니다. 서버 상태를 확인해주세요.'); return; }
        if (files.length === 0) { alert('파일을 먼저 선택해주세요.'); return; }
        setIsAnalyzing(true); setProgress(0);
        let combinedText = "";
        const totalFiles = files.length;
        const interval = setInterval(() => { setProgress(prev => Math.min(prev + 5, 90)); }, 300);

        try {
            for (let i = 0; i < totalFiles; i++) {
                const fd = new FormData();
                fd.append('file', files[i]);
                const res = await fetch('http://localhost:3001/api/ocr/extract', { method: 'POST', body: fd });
                if (!res.ok) throw new Error(`파일 ${i + 1} OCR 실패`);
                const data = await res.json();
                if (data.extractedText) {
                    combinedText += `\n--- 문서 ${i + 1} ---\n` + data.extractedText + "\n";
                }
            }
            clearInterval(interval); setProgress(100);
            setExtractedText(combinedText.trim());
            await structureData(combinedText.trim());
        } catch (error) {
            clearInterval(interval); setIsAnalyzing(false); alert('OCR 오류: ' + error.message);
        }
    };

    const structureData = async (text) => {
        try {
            const res = await fetch('http://localhost:3001/api/ocr/structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extractedText: text })
            });
            if (!res.ok) throw new Error('구조화 실패');
            const data = await res.json();
            setStructuredData(data.structuredData);
            setCurrentStep('structured');
            setIsAnalyzing(false);
        } catch (error) {
            console.error('구조화 오류:', error);
            alert('구조화 중 오류가 발생했습니다. 원본 텍스트로 진행합니다.');
            setCurrentStep('review');
            setIsAnalyzing(false);
        }
    };

    const runFinalAnalysis = async () => {
        const dataToAnalyze = structuredData || extractedText;
        if (!dataToAnalyze || dataToAnalyze.trim().length < 10) {
            alert('내용이 너무 짧습니다. 최소 10자 이상 입력해주세요.');
            return;
        }
        setIsAnalyzing(true); setProgress(0);
        const interval = setInterval(() => { setProgress(prev => Math.min(prev + 5, 90)); }, 400);
        try {
            const res = await fetch('http://localhost:3001/api/analyze/contract', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workerType, companySize, manualText: dataToAnalyze, serviceType: selectedService })
            });
            if (!res.ok) { throw new Error('분석 서버 응답 오류'); }
            const data = await res.json();
            clearInterval(interval); setProgress(100); setResult(data); setCurrentStep('result'); setIsAnalyzing(false);
        } catch (error) { clearInterval(interval); setIsAnalyzing(false); alert('분석 오류: ' + error.message); }
    };

    const handleAnalysisStart = (service) => {
        setSelectedService(service);
        setFiles([]);
        if (previewUrls.length > 0) {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        }
        setPreviewUrls([]);
        setResult(null);
        setProgress(0);
        setExtractedText("");
        setStructuredData("");
        setCurrentStep('upload');
        setGeneratedContract(null);
    };

    const generateContract = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('http://localhost:3001/api/generate/contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisResult: result,
                    originalText: extractedText,
                    workerType,
                    companySize
                })
            });
            if (!res.ok) throw new Error('계약서 생성 오류');
            const data = await res.json();
            setGeneratedContract(data.contractText);
            setCurrentStep('contract');
        } catch (error) {
            alert('계약서 생성 실패: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const renderLawBadges = (lawString) => {
        if (!lawString) return null;
        const laws = lawString.split(/[,;]+/).map(l => l.trim()).filter(l => l && l.length > 2);
        return (
            <div className="law-badge-container">
                {laws.map((law, idx) => (
                    <a key={idx} href={`https://www.law.go.kr/LSW/lsSc.do?menuId=1&query=${encodeURIComponent(law)}`} target="_blank" rel="noopener noreferrer" className="law-badge">
                        ⚖️ {law} <ExternalLink size={12} />
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="header-nav glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck className="text-primary" size={28} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>노동법 자율점검 AI</span>
                </div>
                <div className="nav-user">
                    <div style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isConnected ? '#059669' : '#dc2626' }}>
                            {isConnected ? '서버 연결됨' : '서버 연결 끊김'}
                        </span>
                    </div>
                    <Search size={20} color="var(--text-muted)" />
                    <button
                        onClick={() => setIsAdminMode(!isAdminMode)}
                        className="btn-admin"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}
                    >
                        {isAdminMode ? <X size={24} /> : <Settings size={24} />}
                        <span style={{ fontSize: '0.9rem' }}>{isAdminMode ? '닫기' : '관리자 설정'}</span>
                    </button>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '0.8rem', fontWeight: 600 }}>U</span></div>
                </div>
            </nav>

            {isAdminMode ? (
                <PromptManager onBack={() => setIsAdminMode(false)} />
            ) : (
                <>
                    {!selectedService ? (
                        <main style={{ paddingBottom: '5rem' }}>
                            <section className="hero-section">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                    <h1 className="hero-title">AI가 지키는<br />당신의 노동 권리</h1>
                                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>복잡한 계약서, 클릭 한 번으로 법률 리스크를 진단하세요.</p>
                                </motion.div>
                            </section>

                            <div className="bento-grid">
                                <motion.div className="bento-item glass" whileHover={{ y: -8, scale: 1.02 }} onClick={() => handleAnalysisStart('contract')}>
                                    <div className="bento-char-box">
                                        <motion.img
                                            layoutId="char-img-contract"
                                            src="/contract_char.png"
                                            alt="근로계약서 캐릭터"
                                            className="bento-char-img"
                                        />
                                    </div>
                                    <div className="bento-content">
                                        <div className="bento-header">
                                            <div className="bento-icon-box"><FileText size={20} /></div>
                                            <ArrowRight color="var(--text-muted)" size={18} />
                                        </div>
                                        <h3>근로계약서</h3>
                                        <p className="text-muted">법적 위반 조항 감지</p>
                                        <div className="status-badge status-appropriate">#2단계검증</div>
                                    </div>
                                </motion.div>

                                <motion.div className="bento-item glass" whileHover={{ y: -8, scale: 1.02 }} onClick={() => handleAnalysisStart('rule')}>
                                    <div className="bento-char-box">
                                        <motion.img
                                            layoutId="char-img-rule"
                                            src="/rule_char.png"
                                            alt="취업규칙 캐릭터"
                                            className="bento-char-img"
                                        />
                                    </div>
                                    <div className="bento-content">
                                        <div className="bento-header">
                                            <div className="bento-icon-box"><Scale size={20} /></div>
                                            <ArrowRight color="var(--text-muted)" size={18} />
                                        </div>
                                        <h3>취업규칙</h3>
                                        <p className="text-muted">불리한 조항 분석</p>
                                        <div className="status-badge status-warning">#표준안비교</div>
                                    </div>
                                </motion.div>

                                <motion.div className="bento-item glass" whileHover={{ y: -8, scale: 1.02 }} onClick={() => handleAnalysisStart('salary')}>
                                    <div className="bento-char-box">
                                        <motion.img
                                            layoutId="char-img-salary"
                                            src="/salary_char.png"
                                            alt="임금명세서 캐릭터"
                                            className="bento-char-img"
                                        />
                                    </div>
                                    <div className="bento-content">
                                        <div className="bento-header">
                                            <div className="bento-icon-box"><SlidersHorizontal size={20} /></div>
                                            <ArrowRight color="var(--text-muted)" size={18} />
                                        </div>
                                        <h3>임금명세서</h3>
                                        <p className="text-muted">오지급 수당 자동 계산</p>
                                        <div className="status-badge status-violation">#최저임금검증</div>
                                    </div>
                                </motion.div>
                            </div>
                        </main>
                    ) : (
                        <AnimatePresence>
                            <motion.div className={currentStep === 'result' ? "analysis-overlay" : "upload-modal-overlay"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <StepIndicator currentStep={currentStep} />

                                {currentStep === 'upload' && (
                                    <motion.div className="upload-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.5 }}>
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={() => setSelectedService(null)} style={{ position: 'absolute', top: -10, right: -10, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}><XCircle color="var(--text-muted)" size={28} /></button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                                <img src={getCharImage(selectedService)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                                                    {selectedService === 'contract' ? '근로계약서 분석' : selectedService === 'rule' ? '취업규칙 정밀 점검' : '임금명세서 자동 검증'}
                                                </h2>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>AI가 서류를 분석하여 법적 리스크를 진단해드립니다.</p>
                                            </div>
                                        </div>

                                        {!isAnalyzing ? (
                                            <>
                                                <div style={{ background: '#f0f9ff', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                                                            <span>우리 사업장은</span>
                                                            <div className="select-wrapper">
                                                                <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="select-custom">
                                                                    <option value="under5">상시 5인 미만</option><option value="5more">상시 5인 이상</option>
                                                                </select>
                                                                <ChevronDown size={20} className="select-icon" />
                                                            </div>
                                                            <span>규모이며,</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                                                            <span>저는</span>
                                                            <div className="select-wrapper">
                                                                <select value={workerType} onChange={(e) => setWorkerType(e.target.value)} className="select-custom">
                                                                    <option value="regular">일반(정규직)</option><option value="fixed-term">기간제</option><option value="part-time">알바(단시간)</option>
                                                                </select>
                                                                <ChevronDown size={20} className="select-icon" />
                                                            </div>
                                                            <span>근로자입니다.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dropzone">
                                                    <input type="file" id="fileInput" hidden accept="image/*" multiple onChange={handleFileChange} />
                                                    <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
                                                        <Upload size={40} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
                                                        <h3 style={{ marginBottom: '0.5rem' }}>{files.length > 0 ? `${files.length}개의 파일 선택됨` : '계약서 사진 업로드'}</h3>
                                                        <p className="text-muted">{files.length > 0 ? files.map(f => f.name).join(', ') : '클릭하여 파일을 선택하세요 (여러 장 가능)'}</p>
                                                    </label>
                                                </div>
                                                <button className="analyze-button" onClick={extractOCR} disabled={files.length === 0}>다음: 정보 확인하기</button>
                                            </>
                                        ) : (
                                            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ margin: '0 auto 2rem', width: 64 }}><ShieldCheck size={64} color="var(--primary)" /></motion.div>
                                                <h3 style={{ marginBottom: '1.5rem' }}>텍스트 추출 중... ({progress}%)</h3>
                                                <motion.div
                                                    key={currentTip}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block', maxWidth: '80%' }}
                                                >
                                                    <p style={{ margin: 0, color: '#334155', fontWeight: 600 }}>{currentTip}</p>
                                                </motion.div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {currentStep === 'structured' && (
                                    <div className="split-container" style={{ maxWidth: '100%', width: '100%' }}>
                                        <div className="document-viewer" style={{ flex: 1 }}>
                                            <div style={{ position: 'sticky', top: '2rem', width: '100%' }}>
                                                <h4 style={{ fontWeight: 800, color: '#64748b', marginBottom: '1rem' }}>업로드한 사진 ({previewUrls.length}장)</h4>
                                                {previewUrls.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        {previewUrls.map((url, idx) => (
                                                            <img key={idx} src={url} alt={`Uploaded Document ${idx + 1}`} className="document-image" style={{ width: '100%', borderRadius: '16px', border: '2px solid #e2e8f0' }} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '3rem', background: '#f1f5f9', borderRadius: '16px', textAlign: 'center', color: '#94a3b8' }}>
                                                        <FileText size={48} style={{ margin: '0 auto 1rem' }} />
                                                        <p>이미지가 업로드되지 않았습니다</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="analysis-panel" style={{ flex: 1 }}>
                                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={28} color="var(--primary)" /> AI 구조화 매핑 결과</h2>
                                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>AI가 OCR 텍스트를 분석하여 항목별로 정리했습니다. 왼쪽 사진을 보며 잘못된 부분을 수정해주세요.</p>
                                            <EditableStructureTable structuredData={structuredData} setStructuredData={setStructuredData} />
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                                <button onClick={() => setCurrentStep('upload')} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 700, cursor: 'pointer' }}>이전</button>
                                                <button onClick={runFinalAnalysis} disabled={isAnalyzing} style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: isAnalyzing ? '#94a3b8' : 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: isAnalyzing ? 'not-allowed' : 'pointer' }}>
                                                    {isAnalyzing ? '분석 중...' : '최종 분석 시작'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'review' && (
                                    <div className="split-container" style={{ maxWidth: '100%', width: '100%' }}>
                                        <div className="document-viewer" style={{ flex: 1 }}>
                                            <div style={{ position: 'sticky', top: '2rem', width: '100%' }}>
                                                <h4 style={{ fontWeight: 800, color: '#64748b', marginBottom: '1rem' }}>업로드한 사진 ({previewUrls.length}장)</h4>
                                                {previewUrls.map((url, idx) => (
                                                    <img key={idx} src={url} alt={`Uploaded Document ${idx + 1}`} className="document-image" style={{ width: '100%', borderRadius: '16px', border: '2px solid #e2e8f0', marginBottom: '1rem' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="analysis-panel" style={{ flex: 1 }}>
                                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit3 size={28} color="var(--primary)" /> 추출 내용 확인 및 수정</h2>
                                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>AI가 읽은 내용입니다. 잘못된 부분을 직접 수정해주세요.</p>
                                            <textarea
                                                value={extractedText}
                                                onChange={(e) => setExtractedText(e.target.value)}
                                                style={{ width: '100%', height: '400px', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', lineHeight: '1.6', outline: 'none', fontFamily: 'inherit', marginBottom: '2rem' }}
                                                placeholder="여기에 내용을 작성하거나 수정하세요..."
                                            />
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setCurrentStep('upload')} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 700, cursor: 'pointer' }}>이전</button>
                                                <button onClick={runFinalAnalysis} disabled={isAnalyzing} style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: isAnalyzing ? '#94a3b8' : 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: isAnalyzing ? 'not-allowed' : 'pointer' }}>
                                                    {isAnalyzing ? '분석 중...' : '최종 분석 시작'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'result' && result && (
                                    <div className="split-container">
                                        <div className="document-viewer">
                                            <div style={{ position: 'sticky', top: '2rem', width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <h4 style={{ fontWeight: 800, color: '#64748b' }}>제출된 데이터</h4>
                                                    <button onClick={() => { setResult(null); setSelectedService(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color="#94a3b8" /></button>
                                                </div>
                                                {previewUrls.map((url, idx) => (
                                                    <img key={idx} src={url} alt="Original" className="document-image" style={{ width: '100%', borderRadius: '16px', border: '2px solid #e2e8f0', marginBottom: '1rem' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="analysis-panel">
                                            {isAnalyzing && (
                                                <div className="loading-overlay">
                                                    <div className="loading-content text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                            style={{ marginBottom: '2rem', display: 'inline-block' }}
                                                        >
                                                            <ShieldCheck size={80} color="white" />
                                                        </motion.div>
                                                        <h3 className="text-white text-2xl font-black mb-6">전문 AI가 법령을 검토 중입니다</h3>
                                                        <motion.div
                                                            key={currentTip}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border-2 border-white/30 mb-8 shadow-2xl"
                                                        >
                                                            <p className="text-white font-bold text-lg leading-relaxed">{currentTip}</p>
                                                        </motion.div>
                                                        <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-3">
                                                            <motion.div className="bg-white h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                                                        </div>
                                                        <p className="text-white/80 text-sm font-semibold">{progress}% 완료</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`risk-summary-card ${result.riskLevel === '상' || result.overallStatus === '위험' || result.overallStatus === '부적절' ? 'risk-high' : result.riskLevel === '중' || result.overallStatus === '보완필요' || result.overallStatus === '주의' ? 'risk-medium' : 'risk-low'}`}>
                                                <div className="flex items-center gap-6">
                                                    {result.overallStatus === '위험' || result.overallStatus === '부적절' ? <AlertCircle size={48} /> : <ShieldCheck size={48} />}
                                                    <div>
                                                        <h2 className="text-3xl font-black mb-1">{result.overallStatus}</h2>
                                                        <p className="text-lg font-bold opacity-90">{result.overallOpinion}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="analysis-table-container mt-8">
                                                <table className="analysis-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '15%' }}>항목</th>
                                                            <th style={{ width: '12%', textAlign: 'center' }}>판정</th>
                                                            <th>진단 내용 및 대책</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {result.results?.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="font-bold">
                                                                    {(() => {
                                                                        const match = getRequirementMatch(item.항목);
                                                                        return match ? (
                                                                            <Tooltip content={match.requirement} category={match.category}>{item.항목}</Tooltip>
                                                                        ) : item.항목;
                                                                    })()}
                                                                    <br /><span className="text-[0.7rem] text-slate-400">[{item.적용조건}]</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className={`status-badge ${item.적절성 === '적절' ? 'status-appropriate' : item.적절성 === '부적절' ? 'status-violation' : 'status-warning'}`}>{item.적절성}</span>
                                                                </td>
                                                                <td>
                                                                    <div className={`font-bold mb-2 ${item.적절성 === '부적절' ? 'text-red-600' : 'text-slate-800'}`}>{item.판단이유}</div>
                                                                    <div className="text-slate-500 text-sm mb-3">• {item.발견내용}</div>
                                                                    {renderLawBadges(item.법적근거)}
                                                                    {item.개선권고 && (
                                                                        <Tooltip content={item.개선권고} category="improvement">
                                                                            <div className="mt-3 p-4 bg-slate-50 rounded-xl border-l-4 border-primary text-sm font-semibold cursor-help hover:bg-blue-50 transition-colors inline-block">
                                                                                💡 권고: {item.개선권고.length > 50 ? item.개선권고.substring(0, 50) + '... (호버하여 전체보기)' : item.개선권고}
                                                                            </div>
                                                                        </Tooltip>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {result.finalRecommendations && (
                                                <div className="recommendations-content mt-8 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                                                    <h3 className="flex items-center gap-3 text-amber-900 text-2xl font-black mb-6">
                                                        <Scale size={32} className="text-amber-600" />
                                                        전문가 종합 의견
                                                    </h3>

                                                    <div className="space-y-6">
                                                        {/* 주요 문제점 섹션 */}
                                                        <div className="bg-white rounded-xl p-6 border-l-4 border-red-500 shadow-sm">
                                                            <h4 className="flex items-center gap-2 text-red-700 font-black text-lg mb-4">
                                                                <AlertCircle size={24} />
                                                                주요 문제점
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {result.results
                                                                    ?.filter(item => item.적절성 === '부적절')
                                                                    .slice(0, 5)
                                                                    .map((item, idx) => (
                                                                        <div key={idx} className="flex gap-3 items-start">
                                                                            <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">
                                                                                {idx + 1}
                                                                            </span>
                                                                            <div className="flex-1">
                                                                                <p className="font-bold text-gray-900">{item.항목}</p>
                                                                                <p className="text-sm text-gray-600 mt-1">{item.판단이유?.replace(/<meta[^>]*>/g, '')}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>

                                                        {/* 법적 리스크 섹션 */}
                                                        <div className="bg-white rounded-xl p-6 border-l-4 border-orange-500 shadow-sm">
                                                            <h4 className="flex items-center gap-2 text-orange-700 font-black text-lg mb-4">
                                                                <ShieldCheck size={24} />
                                                                법적 리스크
                                                            </h4>
                                                            <div className="prose prose-sm max-w-none">
                                                                <p className="text-gray-700 leading-relaxed">
                                                                    {result.riskLevel === '상' && (
                                                                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold mr-2">
                                                                            ⚠️ 높은 위험도
                                                                        </span>
                                                                    )}
                                                                    {result.riskLevel === '중' && (
                                                                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold mr-2">
                                                                            ⚡ 중간 위험도
                                                                        </span>
                                                                    )}
                                                                    {result.riskLevel === '하' && (
                                                                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold mr-2">
                                                                            ✓ 낮은 위험도
                                                                        </span>
                                                                    )}
                                                                    현재 계약서는 근로기준법 제17조에 따른 필수 기재사항 중 일부가 누락되어 있어,
                                                                    향후 노동 분쟁 발생 시 사용자에게 불리하게 작용할 수 있습니다.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 개선 방안 섹션 */}
                                                        <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
                                                            <h4 className="flex items-center gap-2 text-blue-700 font-black text-lg mb-4">
                                                                <CheckCircle2 size={24} />
                                                                권장 개선 조치
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {result.results
                                                                    ?.filter(item => item.적절성 !== '적절' && item.개선권고)
                                                                    .slice(0, 5)
                                                                    .map((item, idx) => (
                                                                        <div key={idx} className="flex gap-3 items-start p-3 bg-blue-50 rounded-lg">
                                                                            <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                                                            <div className="flex-1">
                                                                                <p className="font-bold text-gray-900 text-sm">{item.항목}</p>
                                                                                <p className="text-sm text-gray-600 mt-1">{item.개선권고}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>

                                                        {/* AI 전문가 종합 의견 */}
                                                        <div className="bg-white rounded-xl p-8 border-2 border-amber-400 shadow-lg">
                                                            <div className="flex items-start gap-4 mb-4">
                                                                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                                                                    <Scale size={24} className="text-white" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-xl font-black text-gray-900 mb-1">AI 노동법 전문가 종합 의견</h5>
                                                                    <p className="text-sm text-gray-500">분석 결과를 바탕으로 한 전문적 검토 의견</p>
                                                                </div>
                                                            </div>
                                                            <div className="prose prose-sm max-w-none">
                                                                <p className="text-gray-800 font-semibold leading-relaxed whitespace-pre-line border-l-4 border-amber-400 pl-6 py-2">
                                                                    {result.finalRecommendations}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-12 text-center pb-8 flex flex-wrap gap-4 justify-center">
                                                <button
                                                    onClick={generateContract}
                                                    disabled={isGenerating}
                                                    className={`px-8 sm:px-12 py-4 rounded-2xl text-white font-black border-none cursor-pointer flex items-center gap-2 transition-all active:scale-95 ${isGenerating ? 'bg-slate-400' : 'bg-primary'}`}
                                                >
                                                    <FileText size={24} /> {isGenerating ? '계약서 생성 중...' : '근로계약서 생성하기'}
                                                </button>
                                                <button onClick={() => { setSelectedService(null); setCurrentStep('upload'); setGeneratedContract(null); }} className="px-8 sm:px-12 py-4 rounded-2xl bg-slate-800 text-white font-black border-none cursor-pointer transition-all active:scale-95">처음으로</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'contract' && generatedContract && (
                                    <div className="split-container mt-4">
                                        <div className="document-viewer" style={{ flex: 1 }}>
                                            <div style={{ position: 'sticky', top: '2rem', width: '100%' }}>
                                                <h4 className="font-black text-slate-500 mb-4">업로드한 원본 사진</h4>
                                                {previewUrls.map((url, idx) => (
                                                    <img key={idx} src={url} alt={`Original ${idx + 1}`} className="document-image w-full rounded-2xl border-2 border-slate-200 mb-4" />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="analysis-panel" style={{ flex: 1 }}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="flex items-center gap-2 text-2xl font-black"><Edit3 size={28} className="text-primary" /> 표준근로계약서 작성</h2>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { /* PDF print logic */ }} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold border-none cursor-pointer text-sm"><FileText size={16} /> PDF</button>
                                                    <button onClick={() => { /* Word download logic */ }} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold border-none cursor-pointer text-sm"><FileText size={16} /> Word</button>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-primary">
                                                <textarea
                                                    value={generatedContract}
                                                    onChange={(e) => setGeneratedContract(e.target.value)}
                                                    className="w-full h-[600px] p-6 rounded-xl border border-slate-300 text-base leading-relaxed outline-none font-sans whitespace-pre-wrap"
                                                    placeholder="계약서 내용이 여기에 표시됩니다..."
                                                />
                                            </div>

                                            <div className="mt-8 flex gap-4 justify-center">
                                                <button onClick={() => setCurrentStep('result')} className="px-12 py-4 rounded-2xl bg-white border border-slate-300 text-slate-500 font-bold cursor-pointer">이전 단계</button>
                                                <button onClick={() => window.location.reload()} className="px-12 py-4 rounded-2xl bg-slate-800 text-white font-black border-none cursor-pointer">처음으로</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </>
            )}
        </div>
    );
};

export default App;
