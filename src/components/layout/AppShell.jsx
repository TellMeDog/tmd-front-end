import { Outlet } from 'react-router-dom';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <Outlet />
      <MobileBottomNav />
    </>
  );
}
