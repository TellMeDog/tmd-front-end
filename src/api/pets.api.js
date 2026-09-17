import { apiRequest } from './client';

export const getPets = () => apiRequest('/pets');

export const createPets = (pets) => apiRequest('/pets', { method: 'POST', body: pets });

export const updatePet = (petId, pet) =>
  apiRequest(`/pets/${petId}`, { method: 'PUT', body: pet });

export const deletePet = (petId) => apiRequest(`/pets/${petId}`, { method: 'DELETE' });
