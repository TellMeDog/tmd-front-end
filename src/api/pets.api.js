import { apiRequest } from './client';

let petsRequest = null;

export function getPets() {
  if (!petsRequest) {
    petsRequest = apiRequest('/pets').finally(() => {
      petsRequest = null;
    });
  }
  return petsRequest;
}

export const createPets = (pets) => apiRequest('/pets', { method: 'POST', body: pets });

export const updatePet = (petId, pet) =>
  apiRequest(`/pets/${petId}`, { method: 'PATCH', body: pet });

export const deletePet = (petId) => apiRequest(`/pets/${petId}`, { method: 'DELETE' });
