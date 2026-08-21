const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export async function mockRequest(data) {
  return delay({ success: true, data });
}
