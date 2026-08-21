import { ChevronRight, Plus } from 'lucide-react';
import styles from '../shared/ServiceFlows.module.css';
export default function PetManagePage() {
  return (
    <main className="page">
      <span className="eyebrow">MY PETS</span>
      <h1 className="page-title">반려동물 관리</h1>
      <p className="page-description">함께 외출할 반려동물의 정보를 관리해요.</p>
      <section className={`card ${styles.petCard}`}>
        <div className={styles.petPhoto}>🐶</div>
        <div>
          <h2>멍이</h2>
          <p className="page-description">말티즈 · 3.5kg · 소형견</p>
        </div>
        <button className="button button--secondary">
          수정 <ChevronRight size={18} />
        </button>
      </section>
      <div className={styles.addPetAction}>
        <button className="button button--primary">
          <Plus size={18} />
          반려동물 추가
        </button>
      </div>
    </main>
  );
}
