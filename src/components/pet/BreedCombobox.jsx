import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import dogBreeds from '../../data/dogBreeds.json';
import { getKoreanInitials } from '../../utils/korean';
import { getPetBreedLabel } from '../../utils/pet';
import styles from './PetFormModal.module.css';

export default function BreedCombobox({ value, onChange, disabled }) {
  const [query, setQuery] = useState(value ? getPetBreedLabel(value) : '');
  const [open, setOpen] = useState(false);

  const filteredBreeds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replaceAll(' ', '');
    if (!normalizedQuery) return dogBreeds;

    return dogBreeds.filter((breed) => {
      const label = breed.label.toLowerCase().replaceAll(' ', '');
      const initials = getKoreanInitials(breed.label).replaceAll(' ', '');
      const aliases = breed.aliases.join(' ').toLowerCase().replaceAll(' ', '');
      return (
        label.includes(normalizedQuery) ||
        initials.includes(normalizedQuery) ||
        aliases.includes(normalizedQuery) ||
        breed.value.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  const selectBreed = (breed) => {
    onChange(breed.value);
    setQuery(breed.label);
    setOpen(false);
  };

  return (
    <div className={styles.combobox}>
      <div className={styles.comboboxInput}>
        <input
          id="petBreed"
          role="combobox"
          aria-expanded={open}
          aria-controls="pet-breed-options"
          autoComplete="off"
          value={query}
          disabled={disabled}
          placeholder="견종 또는 초성을 입력해 주세요"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange('');
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key === 'Enter' && open && filteredBreeds.length > 0) {
              event.preventDefault();
              selectBreed(filteredBreeds[0]);
            }
          }}
        />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="견종 목록 열기"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {open && (
        <ul id="pet-breed-options" className={styles.options} role="listbox">
          {filteredBreeds.length > 0 ? (
            filteredBreeds.map((breed) => (
              <li key={breed.value}>
                <button type="button" onMouseDown={() => selectBreed(breed)}>
                  <span>{breed.label}</span>
                  <small>{breed.value}</small>
                </button>
              </li>
            ))
          ) : (
            <li className={styles.noOption}>검색 결과가 없습니다.</li>
          )}
        </ul>
      )}
    </div>
  );
}
