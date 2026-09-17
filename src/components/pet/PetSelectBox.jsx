import { ChevronDown, PawPrint } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePetStore } from '../../stores/pet.store';
import styles from './PetSelectBox.module.css';

export default function PetSelectBox({ className = '' }) {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (pets.length === 0) return null;

  const selectedPet = pets.find((pet) => pet.petId === selectedPetId) ?? pets[0];

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <PawPrint size={16} />
        <span>{selectedPet.name}</span>
        <ChevronDown size={16} className={isOpen ? styles.chevronOpen : styles.chevron} />
      </button>

      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {pets.map((pet) => (
            <li key={pet.petId}>
              <button
                type="button"
                role="option"
                aria-selected={pet.petId === selectedPet.petId}
                className={`${styles.option} ${pet.petId === selectedPet.petId ? styles.optionActive : ''}`}
                onClick={() => {
                  setSelectedPetId(pet.petId);
                  setIsOpen(false);
                }}
              >
                {pet.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
