
const TopHeader = ({ selectedService, isConnected }) => {
    const getTitle = () => {
        if (selectedService === 'contract') return '근로계약서 분석';
        if (selectedService === 'salary') return '임금명세서 분석';
        if (selectedService === 'rule') return '취업규칙 분석';
        return '노동법 AI 분석 서비스';
    };

    return (
        <div className="top-bar">
            <div className="top-bar-title">
                {getTitle()}
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
