import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import BrandLogo from '../icons/BrandLogo';
import PetSelectBox from '../pet/PetSelectBox';
import { useAuthStore } from '../../stores/auth.store';
import styles from './Layout.module.css';

const links = [
  ['/', '홈'],
  ['/map', '지도'],
  ['/favorites', '즐겨찾기'],
];

export default function DesktopHeader() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const nickname = useAuthStore((state) => state.nickname);

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
          <NavLink className={styles.profileButton} to={accessToken ? '/my' : '/login'}>
            <span>{accessToken ? (nickname ?? '마이페이지') : '로그인'}</span>
            <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
