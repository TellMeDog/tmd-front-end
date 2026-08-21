import { mockUser } from '../mocks/data/auth';
import { mockRequest } from './client';

export const login = ({ email }) => mockRequest({ ...mockUser, email, accessToken: 'mock-token' });
export const signup = ({ email, nickname }) => mockRequest({ ...mockUser, email, nickname });
