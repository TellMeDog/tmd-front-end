import { Check, PawPrint } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../shared/ServiceFlows.module.css';
const items = [
  { id: 'leash', name: '목줄', desc: '장소 규정상 필수', initial: true },
  { id: 'bag', name: '배변 봉투', desc: '장소 규정상 필수', initial: true },
  { id: 'muzzle', name: '입마개', desc: '착용 대상 반려견만 필수', initial: false },
];
export default function VisitPrepPage() {
  const { placeId } = useParams();
  const [checked, setChecked] = useState(items.filter((x) => x.initial).map((x) => x.id));
  const toggle = (id) =>
    setChecked((value) => (value.includes(id) ? value.filter((x) => x !== id) : [...value, id]));
  return (
    <main className={styles.flow}>
      <section className={`card ${styles.flowHead}`}>
        <span className="eyebrow">BEFORE YOU GO</span>
        <h1>방문 준비 체크</h1>
        <p className="page-description">멍이에게 필요한 준비물을 확인했어요.</p>
        <div className={styles.progress}>
          <span style={{ width: `${(checked.length / items.length) * 100}%` }} />
        </div>
      </section>
      <div className={styles.checks}>
        {items.map((item) => (
          <button
            key={item.id}
            className={`${styles.check} ${checked.includes(item.id) ? styles.active : ''}`}
            onClick={() => toggle(item.id)}
          >
            <span className={styles.circle}>
              {checked.includes(item.id) && <Check size={18} />}
            </span>
            <div>
              <b>{item.name}</b>
              <small>{item.desc}</small>
            </div>
          </button>
        ))}
      </div>
      <div className={styles.tip}>
        <PawPrint size={18} /> 멍이는 입마개 의무 대상이 아니지만 현장 상황에 따라 업체 확인을
        권장해요.
      </div>
      <Link
        className="button button--primary"
        style={{ width: '100%', marginTop: 16 }}
        to={`/places/${placeId}/report`}
      >
        방문 후 결과 알려주기
      </Link>
    </main>
  );
}
