import { ChevronRight, Heart, PawPrint, Settings, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../shared/Pages.module.css';
export default function MyPage() {
  const menu = [
    [PawPrint, '반려동물 관리', '/my/pets'],
    [Heart, '저장한 장소', '/favorites'],
    [ClipboardCheck, '내 방문 제보', '/my/reports'],
    [Settings, '설정', '#'],
  ];
  return (
    <main className="page">
      <span className="eyebrow">MY PAGE</span>
      <h1 className="page-title">마이페이지</h1>
      <section className={`card ${styles.profile}`}>
        <div className={styles.avatar}>🐶</div>
        <div>
          <small>나의 반려동물</small>
          <h2>멍이</h2>
          <p>말티즈 · 3.5kg · 소형견</p>
        </div>
      </section>
      <div className={styles.menu}>
        {menu.map(([Icon, label, to]) => (
          <Link to={to} key={label}>
            <Icon color="var(--color-brand-500)" />
            <b>{label}</b>
            <ChevronRight size={18} style={{ marginLeft: 'auto' }} />
          </Link>
        ))}
      </div>
    </main>
  );
}
