import dogBreeds from '../data/dogBreeds.json';

const SIZE_LABELS = {
  SMALL: '소형견',
  MEDIUM: '중형견',
  LARGE: '대형견',
};

export const getPetSizeLabel = (size) => {
  if (typeof size === 'number') return `${size}kg`;
  if (typeof size === 'string' && size.trim() !== '' && Number.isFinite(Number(size))) {
    return `${size}kg`;
  }
  return SIZE_LABELS[size] ?? size ?? '크기 미등록';
};

export const getPetBreedLabel = (breed) =>
  dogBreeds.find(({ value }) => value === breed)?.label ??
  (breed
    ? breed
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : '품종 미등록');

export function getPetImageSrc(imageUrl) {
  if (!imageUrl) return '';
  if (/^(https?:|blob:|data:)/.test(imageUrl)) return imageUrl;
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL?.replace(/\/$/, '');
  return baseUrl ? `${baseUrl}/${imageUrl.replace(/^\//, '')}` : '';
}
