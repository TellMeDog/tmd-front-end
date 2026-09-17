import { LogOut, UserX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { deleteMyAccount } from '../../api/users.api';
import { useAuthStore } from '../../stores/auth.store';
import FeedbackModal from '../../components/feedback/FeedbackModal';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleLogout = () => {
    setPendingAction('logout');
    setError('');
    clearSession({ signedOut: true });
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    setPendingAction('delete');
    setError('');
    try {
      await deleteMyAccount();
      setDeleteConfirmOpen(false);
      clearSession({ signedOut: true });
      navigate('/signup', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '회원 탈퇴를 처리하지 못했습니다.'));
      setDeleteConfirmOpen(false);
    } finally {
      setPendingAction('');
    }
  };

  return (
    <main className={`page ${styles.page}`}>
      <span className="eyebrow">SETTINGS</span>
      <h1 className="page-title">설정</h1>
      <p className="page-description">계정과 로그인 상태를 관리해요.</p>

      {error && <p className="field-error">{error}</p>}

      <section className={styles.actions}>
        <button
          className="button button--secondary"
          type="button"
          onClick={handleLogout}
          disabled={pendingAction !== ''}
        >
          <LogOut size={18} />
          {pendingAction === 'logout' ? '로그아웃 중...' : '로그아웃'}
        </button>
        <button
          className={`${styles.deleteButton} button`}
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={pendingAction !== ''}
        >
          <UserX size={18} />
          {pendingAction === 'delete' ? '탈퇴 처리 중...' : '회원 탈퇴'}
        </button>
      </section>
      <FeedbackModal
        open={deleteConfirmOpen}
        type="confirm"
        tone="danger"
        title="정말 회원 탈퇴할까요?"
        description={
          '반려동물, 즐겨찾기, 리뷰 정보가 모두 삭제되며\n삭제된 정보는 복구할 수 없습니다.'
        }
        confirmLabel="회원 탈퇴"
        pending={pendingAction === 'delete'}
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </main>
  );
}
