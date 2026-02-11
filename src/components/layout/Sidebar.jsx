import { ShieldCheck, FileText, SlidersHorizontal, Scale, X } from 'lucide-react';

const Sidebar = ({ selectedService, onSelectService, isAdminMode, onToggleAdmin, isOpen, onClose }) => {
    const handleNavClick = (service) => {
        onSelectService(service);
        if (onClose) onClose();
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
                <X size={24} />
            </button>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <ShieldCheck size={24} />
                    <span>노동법 AI 분석</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">분석 서비스</div>
                    <div className={`nav-item ${selectedService === 'contract' ? 'active' : ''}`} onClick={() => handleNavClick('contract')}>
                        <div className="nav-item-icon"><FileText size={18} /></div>
                        <span>근로계약서</span>
                    </div>
                    <div className={`nav-item ${selectedService === 'salary' ? 'active' : ''}`} onClick={() => handleNavClick('salary')}>
                        <div className="nav-item-icon"><SlidersHorizontal size={18} /></div>
                        <span>임금명세서</span>
                    </div>
                    <div className={`nav-item ${selectedService === 'rule' ? 'active' : ''}`} onClick={() => handleNavClick('rule')}>
                        <div className="nav-item-icon"><Scale size={18} /></div>
                        <span>취업규칙</span>
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
