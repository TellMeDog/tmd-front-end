import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import styles from './AppLaunchScreen.module.css';

export default function AppLaunchScreen() {
  const [phase, setPhase] = useState('visible');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    const leaveTimer = window.setTimeout(() => setPhase('leaving'), 1000);
    const hideTimer = window.setTimeout(() => setPhase('hidden'), 1300);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!Capacitor.isNativePlatform() || phase === 'hidden') return null;

  return (
    <div className={`${styles.launch} ${phase === 'leaving' ? styles.leaving : ''}`} role="status">
      <div className={styles.logoWrap}>
        <div className={styles.logoMark}>
          <img src="/images/logo.svg" alt="" />
        </div>
        <span className={styles.shadow} />
      </div>
      <strong>알려줄개</strong>
      <span>함께 갈 수 있는 곳을 알려드릴게요</span>
    </div>
  );
}
