import { REGION_OPTIONS, getRegionDetailOptions } from '../../constants/regions';
import CustomSelect from '../form/CustomSelect';
import styles from './RegionSelectBox.module.css';

export default function RegionSelectBox({ regionName, regionDetailName, onSelect, className = '' }) {
  const detailOptions = getRegionDetailOptions(regionName);

  const handleRegionChange = (nextRegionName) => {
    onSelect(nextRegionName, null);
  };

  const handleDetailChange = (nextDetailName) => {
    onSelect(regionName, nextDetailName);
  };

  return (
    <div className={`${styles.wrap} ${className}`}>
      <CustomSelect
        className={styles.select}
        value={regionName}
        options={REGION_OPTIONS}
        ariaLabel="시도 선택"
        placeholder="시도"
        searchPlaceholder="시도를 입력해 주세요"
        searchable
        onChange={handleRegionChange}
      />
      <CustomSelect
        className={styles.select}
        value={regionDetailName}
        options={detailOptions}
        ariaLabel="시군구 선택"
        placeholder="시군구"
        searchPlaceholder="시군구를 입력해 주세요"
        searchable
        disabled={!regionName}
        onChange={handleDetailChange}
      />
    </div>
  );
}
