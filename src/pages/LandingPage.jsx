import { useState } from 'react';
import { ShieldCheck, CheckCircle2, FileText, ArrowRight, Upload, Menu, X } from 'lucide-react';

const LandingPage = ({ onSelectService }) => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="landing-page">
            {/* Top Header Navigation */}
            <header className="landing-header">
                <div className="landing-header-logo">
                    <ShieldCheck size={28} />
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>노동법 AI 분석</span>
                </div>
                <nav className="landing-nav">
                    <button className="landing-nav-btn" onClick={() => onSelectService('contract')}>근로계약서</button>
                    <button className="landing-nav-btn" onClick={() => onSelectService('salary')}>임금명세서</button>
                    <button className="landing-nav-btn" onClick={() => onSelectService('rule')}>취업규칙</button>
                </nav>
                <button className="landing-hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle menu">
                    {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Navigation */}
            <nav className={`landing-mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
                <button className="landing-nav-btn" onClick={() => onSelectService('contract')}>근로계약서</button>
                <button className="landing-nav-btn" onClick={() => onSelectService('salary')}>임금명세서</button>
                <button className="landing-nav-btn" onClick={() => onSelectService('rule')}>취업규칙</button>
            </nav>

            {/* Main 2-Column Section */}
            <section className="landing-hero">
                {/* Left Column */}
                <div>
                    <div style={{ display: 'inline-block', background: '#f0f4ff', border: '1px solid #d0d9ff', borderRadius: '8px', padding: '8px 16px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#003366' }}>고용노동부</span>
                    </div>

                    <h1 className="landing-hero-title">
                        당신의 노동 권리,<br />AI가 검토해드립니다
                    </h1>

                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>
                        사업장의 사진, 근로계약서, 임금명세서, 취업규칙을 업로드하면
                        AI가 노동법 위반 여부를 즉시 분석합니다
                    </p>

                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <CheckCircle2 size={20} color="#22C55E" />
                            <span style={{ fontSize: '15px', color: '#333' }}>최신 근로기준법 반영</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <CheckCircle2 size={20} color="#22C55E" />
                            <span style={{ fontSize: '15px', color: '#333' }}>무료 분석 서비스</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 size={20} color="#22C55E" />
                            <span style={{ fontSize: '15px', color: '#333' }}>3분 이내 결과 제공</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onSelectService('contract')}
                        style={{
                            padding: '16px 40px',
                            background: '#0056B3',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        분석 시작하기 <ArrowRight size={20} />
                    </button>
                </div>

                {/* Right Column - Upload Zone */}
                <div className="landing-upload-zone">
                    <Upload size={72} color="#0056B3" style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#001F54', marginBottom: '8px' }}>파일을 드래그 & 드롭하거나 클릭하세요</h3>
                    <p style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>근로계약서, 임금명세서, 취업규칙</p>
                    <p style={{ fontSize: '13px', color: '#999' }}>지원 형식: PDF, JPG, PNG (최대 10MB)</p>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <h2 className="landing-features-title">
                    왜 AI 노동법 분석 서비스인가요?
                </h2>
                <div className="landing-features-grid">
                    <div className="landing-feature-card">
                        <div style={{ width: '64px', height: '64px', background: '#e6f0ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ArrowRight size={32} color="#0056B3" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#001F54' }}>신속한 분석</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>복잡한 노동법 조항을 AI가 3분 이내에 자동 분석하여 즉시 결과를 제공합니다.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div style={{ width: '64px', height: '64px', background: '#e6fff0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle2 size={32} color="#22C55E" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#001F54' }}>정확한 검토</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>2026년 최신 근로기준법을 반영하여 법률 위반 사항을 정확하게 식별합니다.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div style={{ width: '64px', height: '64px', background: '#fff4e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FileText size={32} color="#F59E0B" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#001F54' }}>상세한 가이드</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>위반 사항뿐만 아니라 개선 방안과 관련 법조항까지 상세히 안내합니다.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" style={{ padding: '24px 48px' }}>
                <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    &copy; 2026 고용노동부. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
