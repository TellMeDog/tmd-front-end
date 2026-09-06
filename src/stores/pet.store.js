import { create } from 'zustand';

export const usePetStore = create((set) => ({
  pets: [],
  setPets: (pets) => set({ pets }),
  appendPets: (newPets) => set((state) => ({ pets: [...state.pets, ...newPets] })),
  replacePet: (updatedPet) =>
    set((state) => ({
      pets: state.pets.map((pet) => (pet.petId === updatedPet.petId ? updatedPet : pet)),
    })),
  removePet: (petId) => set((state) => ({ pets: state.pets.filter((pet) => pet.petId !== petId) })),
  clearPets: () => set({ pets: [] }),
}));
