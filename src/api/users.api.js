import { apiRequest } from './client';

export const deleteMyAccount = () => apiRequest('/users/me', { method: 'DELETE' });
