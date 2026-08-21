import { ChevronRight, ClipboardCheck } from 'lucide-react';
import styles from '../shared/ServiceFlows.module.css';
export default function MyReportsPage() {
  return (
    <main className="page">
      <span className="eyebrow">MY REPORTS</span>
      <h1 className="page-title">내 방문 제보</h1>
      <p className="page-description">내가 알려준 현장 정보를 확인할 수 있어요.</p>
      <div className={styles.reportList}>
        {['서울숲 반려견 산책길', '오후의 테라스'].map((name, index) => (
          <article className={`card ${styles.report}`} key={name}>
            <span className={styles.reportIcon}>
              <ClipboardCheck size={20} />
            </span>
            <div>
              <h3>{name}</h3>
              <small>
                {index ? '조건이 맞아요' : '조건이 달랐어요'} · 2026.08.{18 - index}
              </small>
            </div>
            <ChevronRight size={18} />
          </article>
        ))}
      </div>
    </main>
  );
}
