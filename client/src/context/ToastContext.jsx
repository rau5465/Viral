import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: '90%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          let bg = 'rgba(22, 27, 34, 0.95)';
          let borderColor = 'rgba(255, 255, 255, 0.15)';
          let icon = <Info size={18} color="#00d2d3" />;

          if (t.type === 'success') {
            borderColor = 'rgba(0, 184, 148, 0.5)';
            icon = <CheckCircle2 size={18} color="#00b894" />;
          } else if (t.type === 'error') {
            borderColor = 'rgba(255, 118, 117, 0.5)';
            icon = <AlertCircle size={18} color="#ff7675" />;
          } else if (t.type === 'warning') {
            borderColor = 'rgba(253, 203, 110, 0.5)';
            icon = <AlertCircle size={18} color="#fdcb6e" />;
          }

          return (
            <div
              key={t.id}
              style={{
                background: bg,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#f0f6fc',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                pointerEvents: 'auto',
                animation: 'slideIn 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8b949e',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
