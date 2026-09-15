import { create } from 'zustand';

export const usePetStore = create((set) => ({
  pets: [],
  selectedPetId: null,
  setPets: (pets) =>
    set((state) => ({
      pets,
      selectedPetId: pets.some((pet) => pet.petId === state.selectedPetId)
        ? state.selectedPetId
        : (pets[0]?.petId ?? null),
    })),
  setSelectedPetId: (selectedPetId) => set({ selectedPetId }),
  appendPets: (newPets) =>
    set((state) => ({
      pets: [...state.pets, ...newPets],
      selectedPetId: state.selectedPetId ?? newPets[0]?.petId ?? null,
    })),
  replacePet: (updatedPet) =>
    set((state) => ({
      pets: state.pets.map((pet) => (pet.petId === updatedPet.petId ? updatedPet : pet)),
    })),
  removePet: (petId) =>
    set((state) => {
      const pets = state.pets.filter((pet) => pet.petId !== petId);
      return {
        pets,
        selectedPetId:
          state.selectedPetId === petId ? (pets[0]?.petId ?? null) : state.selectedPetId,
      };
    }),
  clearPets: () => set({ pets: [], selectedPetId: null }),
}));
