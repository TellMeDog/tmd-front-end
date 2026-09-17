const STORAGE_KEY = 'tmd:mapViewState';

// 장소 상세 페이지에 다녀와도 지도 위치/줌이 그대로 복귀되도록 세션 동안만 기억해 둠
export function saveMapViewState({ center, level }) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ center, level }));
  } catch {
    // 세션 스토리지 접근이 막혀 있어도(시크릿 모드 등) 지도는 정상 동작해야 하므로 무시
  }
}

export function loadMapViewState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
