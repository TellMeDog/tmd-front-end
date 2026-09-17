import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import BrandLogo from '../icons/BrandLogo';
import PetSelectBox from '../pet/PetSelectBox';
import { useAuthStore } from '../../stores/auth.store';
import { usePetStore } from '../../stores/pet.store';
import { getPets } from '../../api/pets.api';
import { useEffect } from 'react';
import styles from './Layout.module.css';

const links = [
  ['/', '홈'],
  ['/map', '지도'],
  ['/favorites', '즐겨찾기'],
];

export default function DesktopHeader() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);

  useEffect(() => {
    if (!accessToken) return;
    getPets()
      .then(setPets)
      .catch(() => {});
  }, [accessToken, setPets]);

  const profileLabel = pets[0]?.name ? `${pets[0].name} 보호자` : '마이페이지';

  return (
    <header className={styles.desktopHeader}>
      <div className={styles.headerInner}>
        <BrandLogo />
        <nav className={styles.desktopNav}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <PetSelectBox />
          <NavLink className={styles.profileButton} to="/my">
            <span>{profileLabel}</span>
            <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
