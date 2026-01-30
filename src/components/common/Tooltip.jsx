import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../../constants';

const Tooltip = ({ content, children, category }) => {
    const [isVisible, setIsVisible] = useState(false);

    const color = CATEGORY_COLORS[category] || "#64748b";

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
                {children}
                {category && (
                    <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: color,
                        marginLeft: '0.25rem'
                    }} />
                )}
            </div>
            {isVisible && content && (
                <div style={{
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
                    pointerEvents: 'none'
                }}>
                    {category && (
                        <div style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            background: color,
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem'
                        }}>
                            {category}
                        </div>
                    )}
                    <div>{content}</div>
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid #1e293b'
                    }} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
