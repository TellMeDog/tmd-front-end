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
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);

  // 헤더의 반려동물 선택 드롭다운이 어느 페이지에서 시작해도 바로 동작하도록 로그인 시 미리 로드
  useEffect(() => {
    if (!accessToken || pets.length > 0) return;
    getPets()
      .then(setPets)
      .catch(() => {});
  }, [accessToken, pets.length, setPets]);

  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <Outlet />
      <MobileBottomNav />
    </>
  );
}
