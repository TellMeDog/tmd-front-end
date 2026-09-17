import { apiRequest } from './client';

export const getPets = () => apiRequest('/pets');

export const createPets = (pets) => apiRequest('/pets', { method: 'POST', body: pets });

export const updatePet = (petId, pet) =>
  apiRequest(`/pets/${petId}`, { method: 'PATCH', body: pet });

export const deletePet = (petId) => apiRequest(`/pets/${petId}`, { method: 'DELETE' });
