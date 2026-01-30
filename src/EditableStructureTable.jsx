import React from 'react';

const EditableStructureTable = ({ structuredData, setStructuredData }) => {
    const updateField = (section, field, type, value) => {
        try {
            const data = typeof structuredData === 'string' ? JSON.parse(structuredData) : structuredData;
            data[section][field][type] = value;
            setStructuredData(JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('Update error:', e);
        }
    };

    try {
        const data = typeof structuredData === 'string' ? JSON.parse(structuredData) : structuredData;

        return (
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                {Object.entries(data).filter(([key]) => key !== '기타사항').map(([sectionName, sectionData]) => (
                    <div key={sectionName} style={{ marginBottom: '2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{sectionName}</h3>
                        </div>
                        <div style={{ padding: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem', color: '#64748b', width: '25%', borderBottom: '1px solid #e2e8f0' }}>항목</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem', color: '#64748b', width: '45%', borderBottom: '1px solid #e2e8f0' }}>내용</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem', color: '#64748b', width: '30%', borderBottom: '1px solid #e2e8f0' }}>비고</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(sectionData).map(([fieldName, fieldData]) => (
                                        <tr key={fieldName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>{fieldName}</td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input
                                                    type="text"
                                                    value={fieldData.value}
                                                    onChange={(e) => updateField(sectionName, fieldName, 'value', e.target.value)}
                                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s' }}
                                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input
                                                    type="text"
                                                    value={fieldData.note}
                                                    onChange={(e) => updateField(sectionName, fieldName, 'note', e.target.value)}
                                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', transition: 'border 0.2s' }}
                                                    placeholder="비고사항"
                                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {data.기타사항 && data.기타사항.length > 0 && (
                    <div style={{ marginBottom: '2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>기타사항</h3>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                            {data.기타사항.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    } catch (e) {
        return (
            <div style={{ padding: '2rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <p style={{ color: '#991b1b', fontWeight: 600, margin: '0 0 0.5rem 0' }}>⚠️ JSON 파싱 오류</p>
                <p style={{ fontSize: '0.9rem', color: '#7f1d1d', margin: 0 }}>{e.message}</p>
                <details style={{ marginTop: '1rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#991b1b', fontWeight: 600 }}>원본 데이터 보기</summary>
                    <pre style={{ marginTop: '0.5rem', padding: '1rem', background: 'white', borderRadius: '6px', overflow: 'auto', fontSize: '0.8rem' }}>
                        {structuredData}
                    </pre>
                </details>
            </div>
        );
    }
};

export default EditableStructureTable;
