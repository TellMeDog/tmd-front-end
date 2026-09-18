import { create } from 'zustand';

// 선택된 반려동물이 없거나 더 이상 목록에 없으면 첫 번째 반려동물로 대체
const resolveSelectedPetId = (pets, currentSelectedPetId) =>
  pets.some((pet) => pet.petId === currentSelectedPetId)
    ? currentSelectedPetId
    : (pets[0]?.petId ?? null);

export const usePetStore = create((set) => ({
  pets: [],
  selectedPetId: null,
  petsLoaded: false,
  setPets: (pets) =>
    set((state) => ({
      pets,
      selectedPetId: resolveSelectedPetId(pets, state.selectedPetId),
      petsLoaded: true,
    })),
  setSelectedPetId: (petId) => set({ selectedPetId: petId }),
  appendPets: (newPets) =>
    set((state) => {
      const pets = [...state.pets, ...newPets];
      return { pets, selectedPetId: resolveSelectedPetId(pets, state.selectedPetId) };
    }),
  replacePet: (updatedPet) =>
    set((state) => ({
      pets: state.pets.map((pet) => (pet.petId === updatedPet.petId ? updatedPet : pet)),
    })),
  removePet: (petId) =>
    set((state) => {
      const pets = state.pets.filter((pet) => pet.petId !== petId);
      return { pets, selectedPetId: resolveSelectedPetId(pets, state.selectedPetId) };
    }),
  clearPets: () => set({ pets: [], selectedPetId: null, petsLoaded: false }),
}));
