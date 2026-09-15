import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './FeedbackModal.module.css';

const ICONS = {
  brand: Info,
  success: CheckCircle2,
  danger: AlertTriangle,
};

export default function FeedbackModal({
  open,
  type = 'alert',
  tone = 'brand',
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  pending = false,
  onConfirm,
  onClose,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open, pending]);

  if (!open) return null;

  const Icon = ICONS[tone] ?? ICONS.brand;

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        className={styles.modal}
        role={type === 'confirm' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-description"
      >
        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          disabled={pending}
          aria-label="닫기"
        >
          <X size={20} />
        </button>
        <span className={`${styles.icon} ${styles[tone]}`}>
          <Icon size={26} />
        </span>
        <h2 id="feedback-modal-title">{title}</h2>
        <p id="feedback-modal-description">{description}</p>
        <div className={styles.actions}>
          {type === 'confirm' && (
            <button
              className="button button--secondary"
              type="button"
              onClick={onClose}
              disabled={pending}
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            className={`${styles.confirmButton} ${styles[tone]}`}
            type="button"
            onClick={onConfirm ?? onClose}
            disabled={pending}
          >
            {pending ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
