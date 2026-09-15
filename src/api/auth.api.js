import { apiRequest } from './client';

export const sendVerificationCode = (email) =>
  apiRequest('/auth/send-verification-code', { method: 'POST', auth: false, body: { email } });

export const verifyEmail = (email, code) =>
  apiRequest('/auth/verify-email', { method: 'POST', auth: false, body: { email, code } });

export const signup = ({ email, nickname, password, confirmPassword }) =>
  apiRequest('/auth/signup', {
    method: 'POST',
    auth: false,
    body: { email, nickname, password, confirmPassword },
  });

export const login = ({ email, password }) =>
  apiRequest('/auth/login', { method: 'POST', auth: false, body: { email, password } });

export const reissue = () =>
  apiRequest('/auth/reissue', { method: 'POST', auth: false, retryOnUnauthorized: false });
