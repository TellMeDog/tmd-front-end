import { useEffect, useState } from 'react';
import { App, View, Toolbar, Link, f7ready } from 'framework7-react';

import { routes } from './routes';

const f7params = {
  name: '알려줄개',
  theme: 'ios', // 'ios' | 'md' | 'auto'
  colors: {
    primary: '#3fae5a',
  },
  view: {
    browserHistory: true, // 브라우저 주소창 URL을 실제로 갱신 (새로고침/뒤로가기/링크 공유 대응)
    browserHistorySeparator: '', // 기본값 '#!' 대신 깔끔한 경로(/map/) 사용
  },
  navbar: {
    iosCenterTitle: false, // iOS 스타일 기본값(가운데 정렬) 대신 왼쪽 정렬, 앱 전체 네브바에 적용됨
  },
};

const tabs = [
  { path: '/', label: '홈', iconIos: 'f7:house_fill', iconMd: 'f7:house_fill' },
  { path: '/map/', label: '지도', iconIos: 'f7:map_pin_ellipse', iconMd: 'f7:map_pin_ellipse' },
  { path: '/bookmarks/', label: '즐겨찾기', iconIos: 'f7:bookmark_fill', iconMd: 'f7:bookmark_fill' },
  { path: '/mypage/', label: '마이', iconIos: 'f7:person_fill', iconMd: 'f7:person_fill' },
];

export default function MainApp() {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    f7ready((f7) => {
      const router = f7.views.main.router;
      setCurrentPath(router.currentRoute.path);
      router.on('routeChange', (newRoute) => setCurrentPath(newRoute.path));
    });
  }, []);

  return (
    <App {...f7params}>
      {/* View 하나 + 실제 라우터 네비게이션. 탭마다 독립된 뒤로가기 스택은 없음 */}
      <View id="main-view" main url="/" routes={routes} className="safe-areas">
        <Toolbar tabbar labels={false} bottom>
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              tabLinkActive={currentPath === tab.path}
              iconIos={tab.iconIos}
              iconMd={tab.iconMd}
            >
              {tab.label}
            </Link>
          ))}
        </Toolbar>
      </View>
    </App>
  );
}
