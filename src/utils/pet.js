import dogBreeds from '../data/dogBreeds.json';

const SIZE_LABELS = {
  SMALL: '소형견',
  MEDIUM: '중형견',
  LARGE: '대형견',
};

export const getPetSizeLabel = (size) => {
  const numericSize =
    typeof size === 'number'
      ? size
      : typeof size === 'string' && size.trim() !== ''
        ? Number(size)
        : NaN;

  if (Number.isFinite(numericSize)) {
    if (numericSize <= 5) return '소형견';
    if (numericSize < 10) return '중형견';
    return '대형견';
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
