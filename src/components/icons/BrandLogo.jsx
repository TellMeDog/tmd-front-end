import { Link } from 'react-router-dom';
import styles from './BrandLogo.module.css';

export default function BrandLogo({ compact = false }) {
  return (
    <Link className={styles.logo} to="/" aria-label="알려줄개 홈">
      <span className={styles.mark}>
        <img src="/images/logo.svg" alt="" />
      </span>
      {!compact && <span>알려줄개</span>}
    </Link>
  );
}
