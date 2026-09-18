import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { getPets } from '../../api/pets.api';
import { useAuthStore } from '../../stores/auth.store';
import { usePetStore } from '../../stores/pet.store';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const petsLoaded = usePetStore((state) => state.petsLoaded);
  const setPets = usePetStore((state) => state.setPets);

  // 헤더의 반려동물 선택 드롭다운이 어느 페이지에서 시작해도 바로 동작하도록 로그인 시 미리 로드
  useEffect(() => {
    if (!accessToken || petsLoaded) return;
    getPets()
      .then(setPets)
      // 반려동물 조회가 일시적으로 실패해도 앱 전체 장소 조회를 막지 않고
      // 비로그인과 같은 일반(회색 마커) 결과로 동작하게 합니다.
      .catch(() => setPets([]));
  }, [accessToken, petsLoaded, setPets]);

  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <Outlet />
      <MobileBottomNav />
    </>
  );
}
