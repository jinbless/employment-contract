import { SlidersHorizontal } from 'lucide-react';
import React from 'react';

const Step2Structure = ({
    structuredData,
    setStructuredData,
    userContext,
    setUserContext,
    onConfirm,
    onReUpload
}) => {
    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#003366' }}>📋 추출된 정보를 확인해주세요</h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>아래 정보가 정확한지 확인하고, 틀린 부분은 직접 수정할 수 있습니다.</p>

            {/* 사용자 컨텍스트 선택 UI */}
            <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#003366', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={20} />
                    사업장 및 근로자 정보 선택
                </h4>

                {/* 사업장 규모 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                        우리 사업장은
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['5인이상', '5인미만'].map(size => (
                            <label key={size} style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: userContext.businessSize === size ? '#e3f2fd' : 'white',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: userContext.businessSize === size ? '1px solid #2196f3' : '1px solid #ddd',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="radio"
                                    name="businessSize"
                                    value={size}
                                    checked={userContext.businessSize === size}
                                    onChange={(e) => setUserContext({ ...userContext, businessSize: e.target.value })}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span style={{ color: userContext.businessSize === size ? '#1976d2' : '#555', fontWeight: 600, fontSize: '13px' }}>{size}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 근로자 유형 */}
                <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                        저는 (복수 선택 가능)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px', flex: 1 }}>
                            {[
                                { value: '정규직', label: '정규직' },
                                { value: '기간제', label: '기간제 근로자' },
                                { value: '단시간', label: '단시간(알바)' },
                                { value: '일용직', label: '일용직' },
                                { value: '연소자', label: '연소자(18세↓)' },
                                { value: '외국인', label: '외국인' },
                                { value: '외국인(농축어업)', label: '외국인(농축어업)' }
                            ].map(type => (
                                <label key={type.value} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: userContext.workerTypes.includes(type.value) ? '#e3f2fd' : 'white',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    border: userContext.workerTypes.includes(type.value) ? '1px solid #2196f3' : '1px solid #ddd',
                                    transition: 'all 0.2s',
                                    fontSize: '12px'
                                }}>
                                    <input
                                        type="checkbox"
                                        value={type.value}
                                        checked={userContext.workerTypes.includes(type.value)}
                                        onChange={(e) => {
                                            const newTypes = e.target.checked
                                                ? [...userContext.workerTypes, type.value]
                                                : userContext.workerTypes.filter(t => t !== type.value);
                                            setUserContext({ ...userContext, workerTypes: newTypes });
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ color: userContext.workerTypes.includes(type.value) ? '#1976d2' : '#555', fontWeight: 500 }}>{type.label}</span>
                                </label>
                            ))}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginLeft: '4px' }}>근로자 입니다.</span>
                    </div>
                </div>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px', background: '#fafafa' }}>
                {Object.entries(structuredData).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#003366', marginBottom: '8px', borderBottom: '2px solid #003366', paddingBottom: '4px' }}>{category}</h4>
                        {typeof items === 'object' && !Array.isArray(items) ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
                                <tbody>
                                    {Object.entries(items).map(([key, val]) => (
                                        <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '8px', fontWeight: 600, color: '#555', width: '35%', fontSize: '12px' }}>{key}</td>
                                            <td style={{ padding: '8px', fontSize: '12px' }}>
                                                {typeof val === 'object' ? (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={val.value || ''}
                                                            onChange={(e) => {
                                                                const newData = { ...structuredData };
                                                                newData[category][key].value = e.target.value;
                                                                setStructuredData(newData);
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 8px',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }}
                                                            placeholder="미기재"
                                                        />
                                                        {val.note && (
                                                            <input
                                                                type="text"
                                                                value={val.note || ''}
                                                                onChange={(e) => {
                                                                    const newData = { ...structuredData };
                                                                    newData[category][key].note = e.target.value;
                                                                    setStructuredData(newData);
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '4px 6px',
                                                                    border: '1px solid #eee',
                                                                    borderRadius: '4px',
                                                                    fontSize: '11px',
                                                                    marginTop: '4px',
                                                                    color: '#888'
                                                                }}
                                                                placeholder="비고"
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={val || ''}
                                                        onChange={(e) => {
                                                            const newData = { ...structuredData };
                                                            newData[category][key] = e.target.value;
                                                            setStructuredData(newData);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '6px 8px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            fontSize: '12px'
                                                        }}
                                                        placeholder="미기재"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : Array.isArray(items) && items.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {items.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: '4px', color: '#666', fontSize: '12px' }}>{item}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingBottom: '16px' }}>
                <button
                    onClick={onReUpload}
                    style={{ padding: '10px 16px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                    다시 업로드
                </button>
                <button
                    onClick={onConfirm}
                    style={{ padding: '10px 20px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                >
                    ✅ 정보 확인 완료, 분석 시작
                </button>
            </div>
        </div>
    );
};

export default Step2Structure;
