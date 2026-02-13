import { useState, useEffect } from 'react';
import { Upload, Camera } from 'lucide-react';

const Step1Upload = ({ onFileChange }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
    }, []);

    return (
        <div className="upload-section">
            <Upload className="upload-icon" size={64} />
            <div className="upload-title">파일을 업로드하세요</div>
            <div className="upload-subtitle">PDF, JPG, PNG (최대 10MB)</div>

            {/* 파일 선택 input */}
            <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={onFileChange}
                style={{ display: 'none' }}
                id="file-input"
            />

            {/* 카메라 촬영 input (모바일 전용) */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
                style={{ display: 'none' }}
                id="camera-input"
            />

            <div className="upload-actions">
                <label htmlFor="file-input" className="upload-button">
                    <Upload size={18} />
                    파일 선택
                </label>
                {isMobile && (
                    <label htmlFor="camera-input" className="upload-button upload-btn-camera">
                        <Camera size={18} />
                        카메라로 촬영
                    </label>
                )}
            </div>
        </div>
    );
};

export default Step1Upload;
