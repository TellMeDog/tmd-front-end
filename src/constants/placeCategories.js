import { BedDouble, Beer, Coffee, Mountain, SlidersHorizontal, Utensils } from 'lucide-react';

export const PLACE_CATEGORIES = [
  { value: null, label: '전체', Icon: SlidersHorizontal },
  { value: '카페', label: '카페', Icon: Coffee },
  { value: '계곡', label: '계곡', Icon: Mountain },
  { value: '숙소', label: '숙소', Icon: BedDouble },
  { value: '음식점', label: '음식점', Icon: Utensils },
  { value: '주점', label: '주점', Icon: Beer },
];

export const CATEGORY_ICON_MAP = Object.fromEntries(
  PLACE_CATEGORIES.filter(({ value }) => value).map(({ value, Icon }) => [value, Icon]),
);
