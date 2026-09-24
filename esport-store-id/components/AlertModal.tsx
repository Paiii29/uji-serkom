'use client';

interface AlertModalProps {
  open: boolean;
  type?: 'warning' | 'error' | 'success' | 'info' | 'confirm';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function AlertModal({
  open,
  type = 'warning',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Mengerti',
  cancelText = 'Batal',
  showCancel = false,
}: AlertModalProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'success':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'info':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      case 'confirm':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error': return '#dc2626';
      case 'success': return '#059669';
      case 'info': return '#2563eb';
      case 'confirm': return '#e60012';
      default: return '#f59e0b';
    }
  };

  const color = getColor();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alert-modal-icon" style={{ color, background: `${color}15` }}>
          {getIcon()}
        </div>

        <h2 className="alert-modal-title" style={{ color }}>
          {title}
        </h2>

        <p className="alert-modal-message">{message}</p>

        <div className="alert-modal-actions">
          {showCancel && (
            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ minWidth: '100px' }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="btn"
            style={{ background: color, borderColor: color }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}