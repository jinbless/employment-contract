import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';

// Global set to track tips shown across the entire session to prevent repetition
const seenTipsHistory = new Set();

const LoadingOverlay = ({ isAnalyzing, progress }) => {
    const [tip, setTip] = useState('');

    useEffect(() => {
        if (isAnalyzing) {
            setTip('💡 근로기준법을 분석하고 있습니다...'); // Initial placeholder

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
                        // Silent fail on individual attempt
                    }
                    attempts++;
                }

                // If we couldn't find a unique one after all attempts, 
                // it means we effectively exhausted our pool or got unlucky.
                // Reset history and show the last one we got to ensure rotation continues.
                if (!foundUnique && lastData && lastData.tip) {
                    seenTipsHistory.clear();
                    seenTipsHistory.add(lastData.tip);
                    setTip(lastData.tip);
                }
            };

            fetchTip();
            // Rotate tips every 3 seconds (faster as requested)
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
