/**
 * 공통 스타일 객체
 * 인라인 스타일 중복을 줄이기 위한 공유 스타일 정의
 */

// 색상 팔레트
export const colors = {
    // Primary
    navyDeep: '#001F54',
    bluePrimary: '#0056B3',
    blueHover: '#004494',

    // Neutral
    grayBg: '#F7F7F7',
    white: '#FFFFFF',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textMuted: '#64748b',

    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',

    // Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
};

// 공통 카드 스타일
export const cardStyle = {
    background: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

// 공통 패널 스타일
export const panelStyle = {
    ...cardStyle,
    padding: '16px',
    marginBottom: '16px',
};

// 헤더 스타일
export const sectionHeaderStyle = {
    padding: '1rem 1.5rem',
    background: '#f8fafc',
    borderBottom: `2px solid ${colors.border}`,
};

// 버튼 스타일
export const buttonStyles = {
    primary: {
        background: colors.bluePrimary,
        color: colors.white,
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    secondary: {
        background: '#f8f9fa',
        color: '#495057',
        border: '1px solid #d9d9d9',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    danger: {
        background: colors.danger,
        color: colors.white,
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    outline: {
        background: 'transparent',
        color: colors.bluePrimary,
        border: `1px solid ${colors.bluePrimary}`,
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

// 입력 필드 스타일
export const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: `1px solid #cbd5e1`,
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border 0.2s',
};

// 테이블 스타일
export const tableStyles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: colors.textMuted,
        background: '#f8fafc',
        borderBottom: `1px solid ${colors.border}`,
    },
    td: {
        padding: '0.75rem 1rem',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: '#475569',
        borderBottom: `1px solid ${colors.borderLight}`,
    },
};

// 상태 배지 스타일
export const statusBadgeStyles = {
    적절: {
        background: 'rgba(34, 197, 94, 0.1)',
        color: colors.success,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
    },
    보완필요: {
        background: 'rgba(245, 158, 11, 0.1)',
        color: colors.warning,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
    },
    부적절: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: colors.danger,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
    },
};

// 툴팁 스타일
export const tooltipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    padding: '0.75rem 1rem',
    background: '#1e293b',
    color: 'white',
    borderRadius: '8px',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    whiteSpace: 'normal',
    width: '300px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    pointerEvents: 'none',
};

// 로딩 스피너 스타일
export const loadingStyle = {
    textAlign: 'center',
    padding: '100px 0',
    color: colors.textMuted,
};

// 에러 박스 스타일
export const errorBoxStyle = {
    padding: '2rem',
    background: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca',
};
