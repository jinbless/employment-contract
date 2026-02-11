import { Menu } from 'lucide-react';

const TopHeader = ({ selectedService, isConnected, onToggleSidebar }) => {
    const getTitle = () => {
        if (selectedService === 'contract') return '근로계약서 분석';
        if (selectedService === 'salary') return '임금명세서 분석';
        if (selectedService === 'rule') return '취업규칙 분석';
        return '노동법 AI 분석 서비스';
    };

    return (
        <div className="top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Open menu">
                    <Menu size={24} />
                </button>
                <div className="top-bar-title">
                    {getTitle()}
                </div>
            </div>
            <div className="top-bar-actions">
                <div className="server-status">
                    <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
                    <span>{isConnected ? '서버 연결됨' : '서버 연결 끊김'}</span>
                </div>
            </div>
        </div>
    );
};

export default TopHeader;
