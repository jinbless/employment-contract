import { FileText, CheckCircle2, Download } from 'lucide-react';
import React from 'react';

const Step4Generation = ({
    previewUrls,
    extractedText,
    generatedContract,
    onContractChange,
    onDownloadWord,
    onDownloadPDF,
    contractRef
}) => {
    return (
        <div className="step4-container">
            {/* Left: Original Contract (Read-only) */}
            <div className="step4-panel">
                <div className="step4-panel-header" style={{ background: '#f8fafc' }}>
                    <FileText size={20} color="#64748b" />
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>원본 계약서</span>
                </div>
                <div className="step4-panel-body" style={{ background: '#f1f5f9' }}>
                    {previewUrls.length > 0 ? (
                        <img src={previewUrls[0]} alt="Original Contract" style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', color: '#334155', background: 'white', padding: '24px', borderRadius: '8px' }}>
                            {extractedText}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Contract Editor */}
            <div className="step4-panel">
                <div className="step4-editor-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={24} color="#10b981" />
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>수정된 표준 근로계약서</span>
                    </div>
                    <div className="step4-btn-group">
                        <button
                            onClick={onDownloadWord}
                            style={{
                                padding: '8px 16px',
                                background: '#E3F2FD',
                                color: '#1565C0',
                                border: '1px solid #BBDEFB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FileText size={16} /> Word 저장
                        </button>
                        <button
                            onClick={onDownloadPDF}
                            style={{
                                padding: '8px 16px',
                                background: '#FCE4EC',
                                color: '#C2185B',
                                border: '1px solid #F8BBD0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Download size={16} /> PDF 저장
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                    <textarea
                        ref={contractRef}
                        className="step4-editor"
                        value={generatedContract}
                        onChange={(e) => onContractChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step4Generation;
