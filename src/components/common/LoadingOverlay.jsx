import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { getRandomTip } from '../../data/loadingTips';

// Global set to track tips shown across the entire session to prevent repetition
const seenTipsHistory = new Set();

const LoadingOverlay = ({ isAnalyzing, progress }) => {
    const [tip, setTip] = useState('');

    useEffect(() => {
        if (isAnalyzing) {
            setTip(getRandomTip()); // 로컬 팁으로 즉시 표시

            const fetchTip = async () => {
                let attempts = 0;
                let foundUnique = false;
                let lastData = null;

                // Retry to find a unique tip (increased attempts)
                while (attempts < 10 && !foundUnique) {
                    try {
                        const res = await apiClient.get(`/tips/random?_t=${Date.now()}`);
                        const data = await res.json();
                        if (data.tip) {
                            lastData = data;
                            if (!seenTipsHistory.has(data.tip)) {
                                setTip(data.tip);
                                seenTipsHistory.add(data.tip);
                                foundUnique = true;
                            }
                        }
                    } catch (error) {
                        // API 실패 시 로컬 팁으로 폴백
                        setTip(getRandomTip());
                        return;
                    }
                    attempts++;
                }

                // If we couldn't find a unique one after all attempts,
                // reset history and use local fallback
                if (!foundUnique) {
                    if (lastData && lastData.tip) {
                        seenTipsHistory.clear();
                        seenTipsHistory.add(lastData.tip);
                        setTip(lastData.tip);
                    } else {
                        setTip(getRandomTip());
                    }
                }
            };

            fetchTip();
            // Rotate tips every 3 seconds
            const interval = setInterval(fetchTip, 3000);
            return () => clearInterval(interval);
        }
    }, [isAnalyzing]);

    if (!isAnalyzing) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-content" style={{ maxWidth: '400px', width: '90%' }}>
                <div className="loading-spinner"></div>
                <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 600, color: '#003366' }}>
                    분석 중... {progress}%
                </div>
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '15px',
                    color: '#495057',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {tip}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
