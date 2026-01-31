import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../utils/apiClient';
import {
    Save, RefreshCw, AlertTriangle, CheckCircle, ChevronLeft,
    FileText, Upload, Trash2, Database, Settings,
    BarChart3, MessageSquare, ClipboardList, History,
    ShieldCheck, LayoutGrid, Search, Bell, User,
    ChevronDown, ChevronRight, X, Download
} from 'lucide-react';

const PromptManager = ({ onBack }) => {
    // UI State
    const [activeMenu, setActiveMenu] = useState('prompt-settings'); // Sidebar menu
    const [selectedPromptKey, setSelectedPromptKey] = useState(null); // Key of prompt being edited in detail
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Data State
    const [prompts, setPrompts] = useState({
        ocrExtraction: { systemPrompt: '', model: 'gpt-4o', temperature: 0, lastUpdated: '25년 09월 02일' },
        structure: { systemPrompt: '', model: 'gpt-4o', temperature: 0, lastUpdated: '25년 12월 22일' },
        analysis: { systemPrompt: '', model: 'gpt-4o', temperature: 0, lastUpdated: '25년 11월 17일' },
        generation: { systemPrompt: '', model: 'gpt-4o', temperature: 0, lastUpdated: '25년 11월 14일' }
    });
    const [dbFiles, setDbFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [uploadingFile, setUploadingFile] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [promptsRes, filesRes] = await Promise.all([
                apiClient.get('/admin/prompts'),
                apiClient.get('/admin/files')
            ]);

            if (promptsRes.ok) {
                const data = await promptsRes.json();
                setPrompts(data);
            }
            if (filesRes.ok) {
                const files = await filesRes.json();
                setDbFiles(files);
            }
        } catch (error) {
            setMessage({ type: 'error', text: '데이터 로딩 실패' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePrompt = async (key, updatedValue) => {
        setIsSaving(true);
        const newPrompts = { ...prompts, [key]: updatedValue };
        try {
            const res = await apiClient.post('/admin/prompts', newPrompts);
            if (res.ok) {
                setPrompts(newPrompts);
                setMessage({ type: 'success', text: '프롬프트가 저장되었습니다.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                setSelectedPromptKey(null); // Close detail view on success
            } else {
                throw new Error('저장 실패');
            }
        } catch (error) {
            setMessage({ type: 'error', text: '프롬프트 저장 실패' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploadingFile(true);
        try {
            const res = await apiClient.postForm('/admin/files/upload', formData);
            if (res.ok) {
                setMessage({ type: 'success', text: `${file.name} 업로드 완료` });
                fetchData();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                throw new Error('업로드 실패');
            }
        } catch (error) {
            setMessage({ type: 'error', text: '파일 업로드 실패' });
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDeleteFile = async (filename) => {
        if (!confirm(`${filename} 파일을 삭제하시겠습니까?`)) return;
        try {
            const res = await apiClient.delete(`/api/admin/files/${filename}`);
            if (res.ok) {
                setMessage({ type: 'success', text: '파일이 삭제되었습니다.' });
                fetchData();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                throw new Error('삭제 실패');
            }
        } catch (error) {
            setMessage({ type: 'error', text: '파일 삭제 실패' });
        }
    };

    // Prompt Detail Modal Component
    const PromptDetailModal = ({ promptKey, data, onClose, onSave }) => {
        const [localData, setLocalData] = useState({ ...data });

        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="modal-content glass"
                >
                    <div className="modal-header">
                        <h2>{promptKey.toUpperCase()} 설정 상세</h2>
                        <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                    </div>
                    <div className="modal-body">
                        <div className="param-grid">
                            <div className="param-item">
                                <label>Model Selection</label>
                                <input
                                    type="text" list="model-options"
                                    value={localData.model}
                                    onChange={(e) => setLocalData({ ...localData, model: e.target.value })}
                                />
                                <datalist id="model-options">
                                    <option value="gpt-4o" /><option value="gpt-4o-mini" /><option value="o1-preview" />
                                </datalist>
                            </div>
                            <div className="param-item">
                                <label>Temperature ({localData.temperature})</label>
                                <input
                                    type="range" min="0" max="2" step="0.1"
                                    value={localData.temperature}
                                    onChange={(e) => setLocalData({ ...localData, temperature: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="param-item mt-4">
                            <label>System Prompt Instruction</label>
                            <textarea
                                value={localData.systemPrompt}
                                onChange={(e) => setLocalData({ ...localData, systemPrompt: e.target.value })}
                                className="modal-textarea"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={onClose} className="btn-secondary">취소</button>
                        <button onClick={() => onSave(promptKey, localData)} className="btn-primary" disabled={isSaving}>
                            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 저장하기
                        </button>
                    </div>
                </motion.div>
                <datalist id="model-options">
                    <option value="gpt-4o" /><option value="gpt-4o-mini" /><option value="o1-preview" />
                </datalist>
            </motion.div>
        );
    };

    if (isLoading) {
        return (
            <div className="admin-loading">
                <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
                <p>관리자 시스템 리소스를 구성 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <img src="/logo-mini.png" alt="logo" />
                    </div>
                    <div className="brand-text">
                        <h3>AI 노동법 상담</h3>
                        <span>관리자 시스템</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <div className="group-label"><BarChart3 size={14} /> 통계 <ChevronDown size={14} /></div>
                    </div>

                    <div className="nav-group active">
                        <div className="group-label"><Settings size={14} /> 파라미터 설정 <ChevronDown size={14} /></div>
                        <div className="group-items">
                            <button
                                className={`nav-item ${activeMenu === 'prompt-settings' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('prompt-settings')}
                            >
                                <span className="dot" /> 노동법 지식 검색 Prompt
                            </button>
                            <button
                                className={`nav-item ${activeMenu === 'db-metadata' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('db-metadata')}
                            >
                                <span className="dot" /> 노동법 지식 검색 Metadata 자료
                            </button>
                            <button className="nav-item"><span className="dot" /> 노동법 지식 검색 Metadata (Old)</button>
                            <button className="nav-item"><span className="dot" /> 노동법 지식 검색 Metadata (New)</button>
                            <button className="nav-item"><span className="dot" /> AI 노동법 상담 테스트</button>
                        </div>
                    </div>

                    <div className="nav-group">
                        <div className="group-label"><Bell size={14} /> 공지 관리 <ChevronRight size={14} /></div>
                    </div>
                    <div className="nav-group">
                        <div className="group-label"><User size={14} /> 사용자 관리 <ChevronRight size={14} /></div>
                    </div>
                    <div className="nav-group">
                        <div className="group-label"><LayoutGrid size={14} /> 전역 설정</div>
                    </div>
                    <div className="nav-group">
                        <div className="group-label"><History size={14} /> LLM 로그</div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="main-header">
                    <div className="breadcrumb">
                        <span className="root">관리자</span>
                        <ChevronRight size={14} />
                        <span>파라미터 설정</span>
                        <ChevronRight size={14} />
                        <span className="current">
                            {activeMenu === 'prompt-settings' ? '노동법 지식 검색 Prompt' : '노동법 지식 검색 Metadata 자료'}
                        </span>
                    </div>
                    <div className="header-actions">
                        <button onClick={onBack} className="btn-exit">메인으로 <X size={16} /></button>
                    </div>
                </header>

                <section className="content-body">
                    <h1 className="page-title">
                        {activeMenu === 'prompt-settings' ? '노동법 지식 검색 설정' : '데이터베이스(Metadata) 관리'}
                    </h1>

                    {activeMenu === 'prompt-settings' ? (
                        <div className="data-table-container glass">
                            <div className="table-filters">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input type="text" placeholder="유형 검색" />
                                </div>
                                <button className="btn-download-all"><Download size={18} /></button>
                            </div>

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>유형</th>
                                        <th>프롬프트 요약</th>
                                        <th>작성 일시</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(prompts).map(([key, value]) => (
                                        <tr key={key}>
                                            <td className="font-bold">{key.toUpperCase()}</td>
                                            <td className="text-muted text-ellipsis">
                                                {value.systemPrompt.substring(0, 80)}...
                                            </td>
                                            <td className="text-sm">{value.lastUpdated || '25년 01월 22일'}</td>
                                            <td>
                                                <button
                                                    className="btn-detail"
                                                    onClick={() => setSelectedPromptKey(key)}
                                                >
                                                    상세
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="data-table-container glass">
                            <div className="table-filters">
                                <h3 className="section-subtitle">참조 데이터 파일 관리</h3>
                                <label className="btn-upload-new">
                                    <Upload size={18} /> {uploadingFile ? '업로드 중...' : '파일 업로드'}
                                    <input type="file" hidden accept=".xlsx, .csv" onChange={handleFileUpload} disabled={uploadingFile} />
                                </label>
                            </div>

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>파일명</th>
                                        <th>유형</th>
                                        <th>위치</th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dbFiles.map((file, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold flex items-center gap-2">
                                                <FileText size={16} /> {file.name}
                                            </td>
                                            <td className="text-uppercase">{file.type}</td>
                                            <td>/{file.location}</td>
                                            <td>
                                                <button
                                                    className="btn-delete-row"
                                                    onClick={() => handleDeleteFile(file.name)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {selectedPromptKey && (
                    <PromptDetailModal
                        promptKey={selectedPromptKey}
                        data={prompts[selectedPromptKey]}
                        onClose={() => setSelectedPromptKey(null)}
                        onSave={handleSavePrompt}
                    />
                )}
            </AnimatePresence>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                    className={`admin-toast ${message.type}`}
                >
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </motion.div>
            )}

            <style>{`
                .admin-layout { display: flex; width: 100vw; height: 100vh; background: #f8fafc; color: #1e293b; overflow: hidden; font-family: 'Pretendard', sans-serif; }

                /* Sidebar Styles */
                .admin-sidebar { width: 280px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: all 0.3s; }
                .sidebar-brand { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #f1f5f9; }
                .brand-logo { width: 32px; height: 32px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .brand-logo img { width: 20px; }
                .brand-text h3 { margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a; }
                .brand-text span { font-size: 0.75rem; color: #64748b; font-weight: 600; }

                .sidebar-nav { flex: 1; padding: 1rem 0; overflow-y: auto; }
                .nav-group { margin-bottom: 0.5rem; }
                .group-label { padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 700; color: #475569; cursor: pointer; transition: background 0.2s; }
                .group-label:hover { background: #f8fafc; }
                .nav-group.active .group-label { color: #3b82f6; }
                .group-label svg:last-child { margin-left: auto; color: #94a3b8; }

                .group-items { padding: 0.25rem 0.5rem 0.25rem 2.5rem; }
                .nav-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; text-align: left; padding: 0.6rem 1rem; border: none; background: none; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
                .nav-item .dot { width: 4px; height: 4px; background: #cbd5e1; border-radius: 50%; }
                .nav-item.active { background: #eff6ff; color: #3b82f6; }
                .nav-item.active .dot { background: #3b82f6; width: 6px; height: 6px; }
                .nav-item:hover:not(.active) { background: #f1f5f9; color: #1e293b; }

                /* Main Content Styles */
                .admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .main-header { padding: 0.75rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
                .breadcrumb .current { color: #64748b; }
                .btn-exit { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f1f5f9; border: none; border-radius: 8px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s; }
                .btn-exit:hover { background: #e2e8f0; color: #ef4444; }

                .content-body { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; }
                .page-title { font-size: 1.75rem; font-weight: 900; color: #0f172a; margin-bottom: 2rem; }

                .data-table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
                .table-filters { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
                .search-box { position: relative; flex: 1; max-width: 300px; display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 1rem; }
                .search-box svg { color: #94a3b8; }
                .search-box input { border: none; background: none; padding: 0.75rem 0.5rem; font-size: 0.9rem; width: 100%; outline: none; font-weight: 600; }
                .btn-download-all { width: 40px; height: 40px; border-radius: 10px; background: #f0fdf4; color: #16a34a; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-download-all:hover { background: #dcfce7; transform: scale(1.05); }

                .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
                .admin-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.85rem; font-weight: 700; color: #64748b; border-bottom: 1px solid #f1f5f9; }
                .admin-table td { padding: 1.25rem 1.5rem; font-size: 0.9rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
                .admin-table tr:hover { background: #fcfdfe; }
                .text-ellipsis { max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .btn-detail { padding: 0.4rem 1.25rem; background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
                .btn-detail:hover { background: #3b82f6; color: white; border-color: #3b82f6; }

                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { width: 90%; max-width: 800px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
                .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
                .modal-body { padding: 2rem; max-height: 70vh; overflow-y: auto; }
                .modal-textarea { width: 100%; min-height: 350px; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.5rem; font-family: monospace; font-size: 0.95rem; line-height: 1.6; resize: none; margin-top: 0.5rem; }
                .modal-footer { padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; }

                .param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .param-item label { display: block; font-size: 0.85rem; font-weight: 800; color: #475569; margin-bottom: 0.5rem; }
                .param-item input[type="text"] { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid #e2e8f0; font-weight: 600; }
                .param-item input[type="range"] { width: 100%; height: 6px; -webkit-appearance: none; background: #e2e8f0; border-radius: 3px; outline: none; margin-top: 1rem; }
                .param-item input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: #3b82f6; border-radius: 50%; cursor: pointer; }

                .btn-primary { padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-primary:hover { background: #2563eb; transform: translateY(-2px); }
                .btn-secondary { padding: 0.75rem 1.5rem; background: white; color: #475569; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 700; cursor: pointer; }

                /* DB Management Specifics */
                .btn-upload-new { background: #3b82f6; color: white; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
                .btn-delete-row { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #94a3b8; border: none; background: none; cursor: pointer; transition: color 0.2s; }
                .btn-delete-row:hover { color: #ef4444; }
                .section-subtitle { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }

                .admin-toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; border-radius: 12px; color: white; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; z-index: 3000; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                .admin-toast.success { background: #10b981; }
                .admin-toast.error { background: #ef4444; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* Helpers */
                .mt-4 { margin-top: 1rem; }
                .font-bold { font-weight: 800; }
                .text-muted { color: #64748b; }
                .text-sm { font-size: 0.8rem; }
                .text-uppercase { text-transform: uppercase; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .gap-2 { gap: 0.5rem; }
            `}</style>
        </div>
    );
};

export default PromptManager;
