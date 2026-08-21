import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import HomePage from '../pages/home/HomePage';
import MapPage from '../pages/map/MapPage';
import FavoritesPage from '../pages/favorites/FavoritesPage';
import MyPage from '../pages/my/MyPage';
import LoginPage from '../pages/login/LoginPage';
import SignupPage from '../pages/signup/SignupPage';
import PlaceDetailPage from '../pages/place-detail/PlaceDetailPage';
import VisitPrepPage from '../pages/visit-prep/VisitPrepPage';
import VisitReportPage from '../pages/visit-report/VisitReportPage';
import PetManagePage from '../pages/pet-manage/PetManagePage';
import MyReportsPage from '../pages/my-reports/MyReportsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="my" element={<MyPage />} />
        <Route path="my/pets" element={<PetManagePage />} />
        <Route path="my/reports" element={<MyReportsPage />} />
        <Route path="places/:placeId" element={<PlaceDetailPage />} />
        <Route path="places/:placeId/prep" element={<VisitPrepPage />} />
        <Route path="places/:placeId/report" element={<VisitReportPage />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
