import regions from '../data/regions.json';

// 백엔드 Region / RegionDetail enum과 동일한 하드코딩 데이터
export const REGIONS = regions;

export const REGION_OPTIONS = regions.map((region) => ({ value: region.name, label: region.name }));

const DETAIL_OPTIONS_BY_REGION = Object.fromEntries(
  regions.map((region) => [
    region.name,
    region.details.map((detail) => ({ value: detail.name, label: detail.name })),
  ]),
);

export const getRegionDetailOptions = (regionName) => DETAIL_OPTIONS_BY_REGION[regionName] ?? [];
