import BrandLogo from '../icons/BrandLogo';
import styles from './Layout.module.css';

export default function MobileHeader() {
  return (
    <header className={styles.mobileHeader}>
      <BrandLogo />
    </header>
  );
}
