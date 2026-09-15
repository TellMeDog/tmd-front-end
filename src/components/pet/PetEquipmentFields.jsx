import { Check } from 'lucide-react';
import styles from './PetEquipmentFields.module.css';

const EQUIPMENT = [
  ['hasLeash', '목줄'],
  ['hasMuzzle', '입마개'],
  ['hasCarrier', '이동장'],
];

export default function PetEquipmentFields({ values, onChange }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>보유 용품</legend>
      <p>현재 준비되어 있는 용품을 선택해 주세요.</p>
      <div className={styles.options}>
        {EQUIPMENT.map(([key, label]) => {
          const checked = Boolean(values[key]);

          return (
            <label className={`${styles.option} ${checked ? styles.selected : ''}`} key={key}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(key, event.target.checked)}
              />
              <span className={styles.checkbox} aria-hidden="true">
                {checked && <Check size={14} strokeWidth={3} />}
              </span>
              <span className={styles.labelText}>
                <b>{label}</b>
                <small>{checked ? '보유 중' : '선택하기'}</small>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
