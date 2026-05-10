import React, { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const ToastContainer = () => (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    padding: '0.85rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    maxWidth: '380px',
                    animation: 'toast-in 0.3s ease',
                    border: '1px solid',
                    backdropFilter: 'blur(12px)',
                    ...(t.type === 'success' ? {
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        borderColor: 'rgba(16, 185, 129, 0.25)',
                        color: '#34d399'
                    } : t.type === 'error' ? {
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        borderColor: 'rgba(239, 68, 68, 0.25)',
                        color: '#f87171'
                    } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#e5e5e5'
                    })
                }}>
                    {t.message}
                </div>
            ))}
        </div>
    );

    return { toast: addToast, ToastContainer };
}
