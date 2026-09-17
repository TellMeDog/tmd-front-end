import { ApiError, apiRequest } from './client';

export const getPresignedUrl = (file, usage) =>
  apiRequest('/images/presigned-url', {
    method: 'POST',
    body: {
      usage,
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    },
  });

export async function uploadToPresignedUrl(file, { presignedUrl, requiredHeaders }) {
  let response;
  try {
    response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: requiredHeaders,
      body: file,
    });
  } catch {
    throw new ApiError('이미지 업로드 서버에 연결할 수 없습니다.');
  }

  if (!response.ok) {
    throw new ApiError('이미지 업로드에 실패했습니다.', { status: response.status });
  }
}

export const completeImageUpload = (uploadId) =>
  apiRequest(`/images/uploads/${uploadId}/complete`, { method: 'POST' });
