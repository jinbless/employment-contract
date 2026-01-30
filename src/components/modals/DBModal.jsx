import { X } from 'lucide-react';

const DBModal = ({ selectedDB, onClose }) => {
    if (!selectedDB) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '16px',
                maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>📚</span>
                        {selectedDB.title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#666' }}
                        onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                    >
                        <X size={24} />
                    </button>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#333', fontSize: '15px' }}>
                    {selectedDB.content}
                </div>
                {selectedDB.law && (
                    <div style={{ marginTop: '24px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#495057' }}>⚖️ 관련 법조문</strong>
                        <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                            {selectedDB.law}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DBModal;
