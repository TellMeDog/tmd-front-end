import { ChevronRight, Heart, PawPrint, Settings, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPets } from '../../api/pets.api';
import { getApiErrorMessage } from '../../api/client';
import { usePetStore } from '../../stores/pet.store';
import { getPetBreedLabel, getPetSizeLabel } from '../../utils/pet';
import styles from '../shared/Pages.module.css';
export default function MyPage() {
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const representativePet = pets[0];

  useEffect(() => {
    let active = true;
    getPets()
      .then((data) => {
        if (active) setPets(data);
      })
      .catch((requestError) => {
        if (active)
          setError(getApiErrorMessage(requestError, '반려견 정보를 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setPets]);

  const menu = [
    [PawPrint, '반려동물 관리', '/my/pets'],
    [Heart, '저장한 장소', '/favorites'],
    [ClipboardCheck, '내 방문 제보', '/my/reports'],
    [Settings, '설정', '/my/settings'],
  ];
  return (
    <main className="page">
      <span className="eyebrow">MY PAGE</span>
      <h1 className="page-title">마이페이지</h1>
      <section className={`card ${styles.profile}`}>
        <div className={styles.avatar}>🐶</div>
        <div>
          <small>나의 반려동물</small>
          {isLoading ? (
            <p>불러오는 중...</p>
          ) : representativePet ? (
            <>
              <h2>{representativePet.name}</h2>
              <p>
                {getPetBreedLabel(representativePet.breed)} ·{' '}
                {getPetSizeLabel(representativePet.size)}
              </p>
            </>
          ) : (
            <p>등록된 반려동물이 없습니다.</p>
          )}
        </div>
      </section>
      {error && <p className="field-error">{error}</p>}
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
