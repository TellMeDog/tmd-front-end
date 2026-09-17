import { usePetStore } from '../../stores/pet.store';
import CustomSelect from '../form/CustomSelect';
import styles from './PetSelectBox.module.css';

export default function PetSelectBox({ className = '' }) {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);

  if (pets.length === 0) return null;

  return (
    <CustomSelect
      className={`${styles.select} ${className}`}
      value={selectedPetId}
      options={pets.map((pet) => ({ value: pet.petId, label: pet.name }))}
      ariaLabel="반려동물 선택"
      onChange={setSelectedPetId}
    />
  );
}
