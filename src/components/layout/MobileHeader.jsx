import BrandLogo from '../icons/BrandLogo';
import PetSelectBox from '../pet/PetSelectBox';
import styles from './Layout.module.css';

export default function MobileHeader() {
  return (
    <header className={styles.mobileHeader}>
      <BrandLogo />
      <PetSelectBox />
    </header>
  );
}
