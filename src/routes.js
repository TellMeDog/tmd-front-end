import HomePage from './pages/home';
import MapPage from './pages/map';
import PlaceDetailPage from './pages/place-detail';
import VisitPrepPage from './pages/visit-prep';
import VisitReportPage from './pages/visit-report';
import BookmarksPage from './pages/bookmarks';
import MyPage from './pages/mypage';
import PetManagePage from './pages/pet-manage';
import MyReportsPage from './pages/my-reports';

// View가 하나뿐인 단일 라우터라 탭 구분 없이 경로가 하나로 통일됨
export const routes = [
  { path: '/', component: HomePage },
  { path: '/map/', component: MapPage },
  { path: '/bookmarks/', component: BookmarksPage },
  { path: '/mypage/', component: MyPage },
  { path: '/mypage/pets/', component: PetManagePage },
  { path: '/mypage/reports/', component: MyReportsPage },
  { path: '/place/:id/', component: PlaceDetailPage },
  { path: '/place/:id/prep/', component: VisitPrepPage },
  { path: '/place/:id/report/', component: VisitReportPage },
];
