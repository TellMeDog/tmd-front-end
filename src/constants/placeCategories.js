import { BedDouble, Coffee, MapPin, ShoppingBag, SlidersHorizontal, Utensils } from 'lucide-react';

export const PLACE_CATEGORIES = [
  { value: null, label: '전체', Icon: SlidersHorizontal },
  { value: '관광지', label: '관광지', Icon: MapPin },
  { value: '카페', label: '카페', Icon: Coffee },
  { value: '음식점', label: '음식점', Icon: Utensils },
  { value: '숙박', label: '숙박', Icon: BedDouble },
  { value: '쇼핑', label: '쇼핑', Icon: ShoppingBag },
];

export const CATEGORY_ICON_MAP = Object.fromEntries(
  PLACE_CATEGORIES.filter(({ value }) => value).map(({ value, Icon }) => [value, Icon]),
);
