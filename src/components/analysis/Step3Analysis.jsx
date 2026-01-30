import { Download, FileText } from 'lucide-react';
import React from 'react';

const Step3Analysis = ({
    analysisResult,
    userContext,
    onDownloadPDF,
    onGenerateContract,
    onSelectDB,
    resultRef
}) => {
    return (
        <div ref={resultRef}>
            {/* 분석 요약 통계 */}
            <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                color: '#333'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#003366' }}>📊 분석 요약</h3>
                    <button
                        onClick={onDownloadPDF}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            color: '#495057',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#e9ecef';
                            e.target.style.color = '#212529';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#f8f9fa';
                            e.target.style.color = '#495057';
                        }}
                    >
                        <Download size={16} /> PDF 다운로드
                    </button>
                </div>

                {/* 사용자 컨텍스트 */}
                <div style={{
                    background: '#f8f9fa',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#555'
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>사업장 규모:</strong> {userContext.businessSize}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>근로자 유형:</strong> {userContext.workerTypes.join(', ')}
                    </div>
                    <div>
                        <strong>적용 조건:</strong> 공통 + {userContext.businessSize} + {userContext.workerTypes.join(' + ')}
                    </div>
                </div>

                {/* 통계 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                            {analysisResult.summary?.총항목 || analysisResult.results?.length || 0}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>총 항목</div>
                    </div>
                    <div style={{ background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#cf1322' }}>
                            {analysisResult.summary?.위반 || analysisResult.results?.filter(r => r.적절성 === '부적절').length || 0}
                        </div>
                        <div style={{ fontSize: '13px', color: '#a8071a' }}>위반</div>
                    </div>
                    <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#d48806' }}>
                            {analysisResult.summary?.경고 || analysisResult.results?.filter(r => r.적절성 === '보완필요').length || 0}
                        </div>
                        <div style={{ fontSize: '13px', color: '#ad6800' }}>보완필요</div>
                    </div>
                    <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#389e0d' }}>
                            {analysisResult.summary?.준수 || analysisResult.results?.filter(r => r.적절성 === '적절').length || 0}
                        </div>
                        <div style={{ fontSize: '13px', color: '#237804' }}>적절</div>
                    </div>
                </div>
            </div>

            {/* 분석 결과 카드들 */}
            {analysisResult.results?.map((item, idx) => (
                <div key={idx} className={`analysis-card ${item.적절성 === '적절' ? 'pass' : item.적절성 === '보완필요' ? 'warning' : 'violation'}`}>
                    <div className="card-header">
                        <div className="card-title">
                            <span style={{ fontSize: '0.9em', color: '#666', marginRight: '6px' }}>[{item.적용조건}]</span>
                            {item.항목}
                        </div>
                        <div className={`status-badge ${item.적절성 === '적절' ? 'pass' : item.적절성 === '보완필요' ? 'warning' : 'violation'}`}>
                            {item.적절성}
                        </div>
                    </div>
                    <div className="card-content">
                        <div style={{ marginBottom: '8px' }}>
                            {item.판단이유 ? item.판단이유.replace(/<meta\s+[^>]+>/g, '') : ''}
                        </div>
                        {item.개선권고 && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                background: '#fffde7', // 더 연한 노란색
                                borderLeft: '4px solid #fbc02d',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: '#f57f17'
                            }}>
                                <strong>💡 개선 제안:</strong> {item.개선권고}
                            </div>
                        )}
                    </div>

                    {/* 법령 및 DB 태그 (오른쪽 하단) */}
                    <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        justifyContent: 'flex-end'
                    }}>
                        {/* 법령 태그 (String -> Array 변환) */}
                        {(() => {
                            const laws = Array.isArray(item.법적근거)
                                ? item.법적근거
                                : typeof item.법적근거 === 'string'
                                    ? item.법적근거.split(',').map(s => s.trim()).filter(Boolean)
                                    : [];

                            return laws.map((law, lawIdx) => (
                                <a
                                    key={`law-${lawIdx}`}
                                    href={`https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=&lsNm=${encodeURIComponent(law.split(' ')[0])}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        background: '#e3f2fd',
                                        color: '#1976d2',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        border: '1px solid #90caf9',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#1976d2';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#e3f2fd';
                                        e.target.style.color = '#1976d2';
                                    }}
                                >
                                    📜 {law}
                                </a>
                            ));
                        })()}

                        {/* DB 태그 (Meta Tag 추출) - 법령 태그와 같은 레벨 */}
                        {(() => {
                            const dbTags = [];
                            const metaRegex = /<meta\s+db="([^"]+)"\s+n="([^"]+)"\s*\/?>/g;
                            let match;
                            const reasonText = item.판단이유 || "";

                            while ((match = metaRegex.exec(reasonText)) !== null) {
                                // DB_퇴직금 -> 퇴직금 변환
                                const dbName = match[1].replace('DB_', '');
                                const topicId = match[2];
                                dbTags.push({ key: `${dbName} ${topicId}` });
                            }

                            // 기존 연관DB 배열이 있다면 합침 (호환성)
                            if (Array.isArray(item.연관DB)) {
                                item.연관DB.forEach(db => dbTags.push({ key: db }));
                            }

                            return dbTags.map((tag, dbIdx) => {
                                const tagKey = tag.key;
                                const refData = analysisResult.dbReferences?.[tagKey];

                                return (
                                    <span
                                        key={`db-${dbIdx}`}
                                        onClick={() => refData && onSelectDB(refData)}
                                        style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            background: refData ? '#f3e5f5' : '#eee', // 데이터 있으면 보라색, 없으면 회색
                                            color: refData ? '#7b1fa2' : '#999',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            border: refData ? '1px solid #ce93d8' : '1px solid #ddd',
                                            cursor: refData ? 'pointer' : 'default',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (refData) {
                                                e.target.style.background = '#7b1fa2';
                                                e.target.style.color = 'white';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (refData) {
                                                e.target.style.background = '#f3e5f5';
                                                e.target.style.color = '#7b1fa2';
                                            }
                                        }}
                                    >
                                        {refData ? '📚' : '🔒'} {tagKey}
                                    </span>
                                );
                            });
                        })()}
                    </div>
                </div>
            ))}

            {/* 하단 액션 버튼 */}
            <div style={{
                marginTop: '40px',
                textAlign: 'center',
                paddingTop: '20px',
                borderTop: '1px solid #eee'
            }}>
                <button
                    onClick={onGenerateContract}
                    style={{
                        background: '#003366', // Navy theme
                        color: 'white',
                        border: 'none',
                        padding: '16px 40px',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 51, 102, 0.3)',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(0, 51, 102, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 51, 102, 0.3)';
                    }}
                >
                    <FileText size={24} />
                    수정 계약서 작성하기 (Step 4)
                </button>
                <div style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
                    * 위반/보완필요 사항이 수정된 표준 근로계약서를 자동으로 생성합니다.
                </div>
            </div>
        </div>
    );
};

export default Step3Analysis;
