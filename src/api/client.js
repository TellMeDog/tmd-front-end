import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fieldErrors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Map과 기존 장소 API가 실제 API로 전환되기 전까지 사용하는 호환용 mock client입니다.
export async function mockRequest(data) {
  return delay({ success: true, data });
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message ?? '요청을 처리하지 못했습니다.', {
      status: response.status,
      code: payload?.code,
      fieldErrors: payload?.invalidFieldErrors ?? [],
    });
  }

  return payload?.data ?? null;
}

async function execute(path, options = {}) {
  const { auth = true, retryOnUnauthorized = true, body, headers, ...fetchOptions } = options;
  const accessToken = useAuthStore.getState().accessToken;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (auth && accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      body: body === undefined || body instanceof FormData ? body : JSON.stringify(body),
      headers: requestHeaders,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (response.status === 401 && auth && retryOnUnauthorized) {
    if (!refreshPromise) {
      refreshPromise = execute('/auth/reissue', {
        method: 'POST',
        auth: false,
        retryOnUnauthorized: false,
      })
        .then(({ accessToken: newAccessToken }) => {
          useAuthStore.getState().setAccessToken(newAccessToken);
          return newAccessToken;
        })
        .catch((error) => {
          useAuthStore.getState().clearSession();
          throw error;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    await refreshPromise;
    return execute(path, { ...options, retryOnUnauthorized: false });
  }

  return parseResponse(response);
}

export function apiRequest(path, options) {
  return execute(path, options);
}

export function getApiErrorMessage(error, fallback = '요청을 처리하지 못했습니다.') {
  return error?.fieldErrors?.[0]?.reason ?? error?.message ?? fallback;
}
