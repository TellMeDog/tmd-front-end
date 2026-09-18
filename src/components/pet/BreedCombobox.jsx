import dogBreeds from '../../data/dogBreeds.json';
import { getKoreanInitials } from '../../utils/korean';
import CustomSelect from '../form/CustomSelect';

const BREED_OPTIONS = dogBreeds.map((breed) => ({
  value: breed.value,
  label: breed.label,
  description: breed.aliases[0],
  searchText: `${getKoreanInitials(breed.label)} ${breed.aliases.join(' ')}`,
}));

export default function BreedCombobox({ value, onChange, disabled }) {
  return (
    <CustomSelect
      id="petBreed"
      value={value}
      options={BREED_OPTIONS}
      onChange={onChange}
      ariaLabel="견종"
      placeholder="견종을 선택해 주세요"
      searchPlaceholder="견종 또는 초성을 입력해 주세요"
      placement="inline"
      searchable
      disabled={disabled}
    />
  );
}
