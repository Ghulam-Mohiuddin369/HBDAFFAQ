import { useEffect } from 'react';
import { closeDialog, usePopups } from '../ui';
import Icon from './Icon';

const ICONS = { success: 'check', error: 'alert', info: 'sparkles' };

export default function Popups() {
  const { toasts, dialog } = usePopups();

  useEffect(() => {
    if (!dialog) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeDialog(false);
      if (e.key === 'Enter') closeDialog(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  return (
    <>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast is-${t.tone}`} role="status">
            <span className="toast-icon"><Icon name={ICONS[t.tone] || ICONS.info} size={20} /></span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      {dialog && (
        <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeDialog(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-label={dialog.title}>
            <span className="dialog-icon"><Icon name={dialog.icon} size={30} /></span>
            <h3>{dialog.title}</h3>
            {dialog.message && <p>{dialog.message}</p>}
            <div className="dialog-actions">
              {dialog.cancelText && (
                <button className="btn btn-sm" onClick={() => closeDialog(false)}>{dialog.cancelText}</button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => closeDialog(true)} autoFocus>
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
