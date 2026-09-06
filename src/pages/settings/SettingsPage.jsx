import { LogOut, UserX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth.api';
import { getApiErrorMessage } from '../../api/client';
import { deleteMyAccount } from '../../api/users.api';
import { useAuthStore } from '../../stores/auth.store';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setPendingAction('logout');
    setError('');
    try {
      await logout();
    } catch {
      // 서버 로그아웃 실패 시에도 현재 브라우저의 access token은 제거합니다.
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '회원 탈퇴 시 반려견과 즐겨찾기 정보가 모두 삭제됩니다. 탈퇴할까요?',
    );
    if (!confirmed) return;

    setPendingAction('delete');
    setError('');
    try {
      await deleteMyAccount();
      clearSession();
      navigate('/signup', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '회원 탈퇴를 처리하지 못했습니다.'));
    } finally {
      setPendingAction('');
    }
  };

  return (
    <main className="page">
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
          onClick={handleDeleteAccount}
          disabled={pendingAction !== ''}
        >
          <UserX size={18} />
          {pendingAction === 'delete' ? '탈퇴 처리 중...' : '회원 탈퇴'}
        </button>
      </section>
    </main>
  );
}
