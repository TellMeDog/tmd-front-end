import { Heart, Home, Map, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.css';

const tabs = [
  { to: '/', label: '메인', Icon: Home },
  { to: '/map', label: '지도', Icon: Map },
  { to: '/favorites', label: '즐겨찾기', Icon: Heart },
  { to: '/my', label: '마이페이지', Icon: UserRound },
];

export default function MobileBottomNav() {
  return (
    <nav className={styles.mobileBottomNav}>
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => (isActive ? styles.activeTab : '')}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
