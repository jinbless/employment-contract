import { Upload } from 'lucide-react';

const Step1Upload = ({ onFileChange }) => {
    return (
        <div className="upload-section">
            <Upload className="upload-icon" size={64} />
            <div className="upload-title">파일을 업로드하세요</div>
            <div className="upload-subtitle">PDF, JPG, PNG (최대 10MB)</div>
            <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={onFileChange}
                style={{ display: 'none' }}
                id="file-input"
            />
            <label htmlFor="file-input" className="upload-button">파일 선택</label>
        </div>
    );
};

export default Step1Upload;
