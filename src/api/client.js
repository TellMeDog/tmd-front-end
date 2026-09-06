const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export async function mockRequest(data) {
  return delay({ success: true, data });
}

export async function apiRequest(path, { params } = {}) {
  const url = new URL(`${import.meta.env.VITE_API_BASE_URL}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  if (!response.ok) {
    throw new Error(`API 요청에 실패했어요. (${response.status})`);
  }
  return response.json();
}
