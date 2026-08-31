import { PLACE_CATEGORIES } from '../../constants/placeCategories';
import styles from './PlaceFilterBar.module.css';

export default function PlaceFilterBar({ active = null, onSelect, className = '' }) {
  return (
    <div className={`${styles.bar} ${className}`}>
      {PLACE_CATEGORIES.map(({ value, label, Icon }) => (
        <button
          key={label}
          type="button"
          className={`${styles.chip} ${active === value ? styles.active : ''}`}
          onClick={() => onSelect(value)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
}
