import { ShieldCheck, CheckCircle2, FileText, ArrowRight, Upload } from 'lucide-react';

const LandingPage = ({ onSelectService }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'white' }}>
            {/* Top Header Navigation */}
            <header style={{ background: '#003366', color: 'white', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={28} />
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>노동법 AI 분석</span>
                </div>
                <nav style={{ display: 'flex', gap: '32px' }}>
                    <button onClick={() => onSelectService('contract')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}>근로계약서</button>
                    <button onClick={() => onSelectService('salary')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}>임금명세서</button>
                    <button onClick={() => onSelectService('rule')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}>취업규칙</button>
                </nav>
            </header>

            {/* Main 2-Column Section */}
            <section style={{ padding: '80px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Left Column */}
                <div>
                    <div style={{ display: 'inline-block', background: '#f0f4ff', border: '1px solid #d0d9ff', borderRadius: '8px', padding: '8px 16px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#003366' }}>고용노동부</span>
                    </div>

                    <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.2, color: '#001F54', marginBottom: '24px' }}>
                        당신의 노동 권리,<br />AI가 검토해드립니다
                    </h1>

                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>
                        사업장의 사진, 근로계약서, 임금명세서, 취업규칙을 업로드하면<br />
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
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px', border: '2px dashed #0056B3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '450px' }}>
                    <Upload size={72} color="#0056B3" style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#001F54', marginBottom: '8px' }}>파일을 드래그 & 드롭하거나 클릭하세요</h3>
                    <p style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>근로계약서, 임금명세서, 취업규칙</p>
                    <p style={{ fontSize: '13px', color: '#999' }}>지원 형식: PDF, JPG, PNG (최대 10MB)</p>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ background: '#f8f9fa', padding: '80px 48px' }}>
                <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 700, color: '#001F54', marginBottom: '64px' }}>
                    왜 AI 노동법 분석 서비스인가요?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#e6f0ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ArrowRight size={32} color="#0056B3" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#001F54' }}>신속한 분석</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>복잡한 노동법 조항을 AI가 3분 이내에 자동 분석하여 즉시 결과를 제공합니다.</p>
                    </div>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#e6fff0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle2 size={32} color="#22C55E" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#001F54' }}>정확한 검토</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>2026년 최신 근로기준법을 반영하여 법률 위반 사항을 정확하게 식별합니다.</p>
                    </div>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#fff4e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FileText size={32} color="#F59E0B" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#001F54' }}>상세한 가이드</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>위반 사항뿐만 아니라 개선 방안과 관련 법조항까지 상세히 안내합니다.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#001F54', color: 'white', padding: '48px 48px 32px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>분석 서비스</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button onClick={() => onSelectService('contract')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>근로계약서</button>
                            <button onClick={() => onSelectService('salary')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>임금명세서</button>
                            <button onClick={() => onSelectService('rule')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>취업규칙</button>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>고객지원</h4>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                            <p>문의하기</p>
                            <p>개인정보처리방침</p>
                            <p>이용약관</p>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>관련기관</h4>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                            <p>고용노동부</p>
                            <p>AI 노동법 상담(ai.moel.go.kr)</p>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>연락처</h4>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                            <p style={{ fontWeight: 700, marginBottom: '4px' }}>고용노동부</p>
                            <p style={{ marginBottom: '8px' }}>(30117) 세종특별자치시 한누리대로 422. 정부세종청사 11동</p>
                            <p>대표전화 1350(유료, 평일 09시~18시)</p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', marginBottom: '8px' }}>*평일 근무시간(09:00~18:00) 이후 업무상담은 제한될 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '32px', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    © 2026 고용노동부. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
