import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import BrandLogo from '../icons/BrandLogo';
import styles from './Layout.module.css';

const links = [
  ['/', '홈'],
  ['/map', '지도'],
  ['/favorites', '즐겨찾기'],
];

export default function DesktopHeader() {
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
          <NavLink className={styles.profileButton} to="/my">
            <span>멍이 보호자</span>
            <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
