import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

let refreshPromise = null;
const inFlightGetRequests = new Map();

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
    try {
      await refreshAccessToken();
    } catch (error) {
      useAuthStore.getState().expireSession();
      throw error;
    }
    return execute(path, { ...options, retryOnUnauthorized: false });
  }

  return parseResponse(response);
}

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = execute('/auth/reissue', {
      method: 'POST',
      auth: false,
      retryOnUnauthorized: false,
    })
      .then((session) => {
        if (!session?.accessToken) {
          throw new ApiError('로그인 정보를 다시 확인해 주세요.', {
            status: 401,
            code: 'INVALID_REISSUE_RESPONSE',
          });
        }
        useAuthStore.getState().setAccessToken(session.accessToken);
        return session;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function createGetRequestKey(path, options) {
  const auth = options.auth !== false;
  const accessToken = auth ? (useAuthStore.getState().accessToken ?? '') : '';
  const headers = [...new Headers(options.headers).entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return JSON.stringify([path, auth, accessToken, headers]);
}

export function apiRequest(path, options = {}) {
  const method = (options.method ?? 'GET').toUpperCase();
  if (method !== 'GET') return execute(path, options);

  const requestKey = createGetRequestKey(path, options);
  const pendingRequest = inFlightGetRequests.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const request = execute(path, options).finally(() => {
    if (inFlightGetRequests.get(requestKey) === request) {
      inFlightGetRequests.delete(requestKey);
    }
  });
  inFlightGetRequests.set(requestKey, request);
  return request;
}

export function getApiErrorMessage(error, fallback = '요청을 처리하지 못했습니다.') {
  return error?.fieldErrors?.[0]?.reason ?? error?.message ?? fallback;
}
