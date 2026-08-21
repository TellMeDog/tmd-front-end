import { Check, CircleAlert, CircleCheck, CircleX } from 'lucide-react';
import { useState } from 'react';
import styles from '../shared/ServiceFlows.module.css';
const choices = [
  ['MATCHED', CircleCheck, '조건이 맞아요', '안내된 조건으로 입장했어요'],
  ['MISMATCHED_INFO', CircleAlert, '조건이 달랐어요', '현장 규정이 안내와 달랐어요'],
  ['DENIED', CircleX, '입장을 거부당했어요', '조건을 지켰지만 입장하지 못했어요'],
];
export default function VisitReportPage() {
  const [selected, setSelected] = useState('');
  return (
    <main className={styles.flow}>
      <section className={`card ${styles.flowHead}`}>
        <span className="eyebrow">VISIT REPORT</span>
        <h1>방문 결과를 알려주세요</h1>
        <p className="page-description">보호자님의 경험이 다른 반려가족의 헛걸음을 줄여요.</p>
      </section>
      <div className={styles.choices}>
        {choices.map(([id, Icon, title, desc]) => (
          <button
            key={id}
            className={`${styles.choice} ${selected === id ? styles.active : ''}`}
            onClick={() => setSelected(id)}
          >
            <span className={styles.circle}>
              {selected === id ? <Check size={18} /> : <Icon size={18} />}
            </span>
            <div>
              <b>{title}</b>
              <small>{desc}</small>
            </div>
          </button>
        ))}
      </div>
      <button className="button button--primary" style={{ width: '100%' }} disabled={!selected}>
        제보 등록하기
      </button>
    </main>
  );
}
