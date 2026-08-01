# 알려줄개 (moong-app)

반려동물과 함께 갈 수 있는 장소를 안내하는 앱.
React + Framework7(React 버전) 기반, 추후 Capacitor로 iOS/Android 앱 빌드 예정.

## 1. 시작하기 (VS Code)

```bash
npm install
npm run dev
```

## 2. 폴더 구조

```
moong-app/
├─ index.html              # 진입 HTML (viewport 모바일 대응 설정 포함)
├─ vite.config.js
├─ package.json
└─ src/
   ├─ main.jsx              # 앱 부트스트랩 + Framework7 CSS 로드
   ├─ App.jsx                # 최상위 App: 탭바 4개(홈/지도/즐겨찾기/마이) + 독립 View 4개
   ├─ routes.js              # 탭별 라우트 정의 (탭마다 자기만의 뒤로가기 스택을 가짐)
   ├─ css/
   │  └─ app.css             # 전역 커스텀 스타일 (F7 테마 컬러 등)
   ├─ api/
   │  └─ client.js           # 백엔드 요청 공통 함수 (base URL, 에러 처리)
   ├─ data/                  # (예정) 목데이터, API 응답 캐시 등
   ├─ components/            # (예정) 여러 페이지에서 재사용하는 컴포넌트
   └─ pages/
      ├─ home.jsx            # ① 홈 - 검색, 카테고리, 추천 장소
      ├─ map.jsx             # ② 지도 - 지도 SDK 자리(TODO), 필터
      ├─ place-detail.jsx    # ③ 장소 상세 - 판정 이유, 길찾기, 준비/제보 진입
      ├─ visit-prep.jsx      # ④ 헛걸음 방지 체크리스트 (목줄/배변봉투/입마개 등)
      ├─ visit-report.jsx    # ⑤ 방문 결과 제보 (입장/조건 다름/거부)
      ├─ bookmarks.jsx       # 즐겨찾기 탭
      ├─ mypage.jsx          # 마이 탭 홈
      ├─ pet-manage.jsx      # 반려동물 관리
      └─ my-reports.jsx      # 내 방문 제보 목록
```

## 3. 탭바 구조 (App.jsx)

Framework7은 탭 4개를 "각자 독립된 라우터를 가진 View"로 다루는 게 표준 패턴이에요.
그래서 `App.jsx`에 `<View>`를 4개 두고, 각 View는 `routes.js`에서 자기 라우트 배열만
받습니다. 이렇게 하면 "지도" 탭에서 상세페이지를 열어도 "홈" 탭의 스크롤/스택은
그대로 유지돼요 (인스타그램 하단 탭 느낌).

새 화면을 추가하려면:
1. `src/pages/새화면.jsx` 파일 생성
2. `src/routes.js`에 해당 탭의 routes 배열에 `{ path: '/경로/', component: 새화면 }` 추가
3. 페이지 안에서 `<Link href="/경로/">`, 또는 `f7router.navigate('/경로/')`로 이동

## 4. 나중에 Capacitor로 앱 전환할 때 (지금은 안 해도 됨)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "알려줄개" com.yourcompany.moongapp
npm run build          # dist/ 생성
npx cap add ios
npx cap add android
npx cap sync
```

Vite 빌드 결과물(`dist`)이 Capacitor의 `webDir`이 되도록 `capacitor.config.json`의
`webDir: "dist"`만 확인하면 됩니다. Framework7은 하이브리드 앱에 최적화된 UI 프레임워크라
그대로 잘 붙습니다 (상태바, 세이프에어리어 처리 등은 나중에 `@capacitor/status-bar`로 조정).

## 5. 지도 SDK

`src/pages/map.jsx`에 TODO로 표시해뒀어요. 카카오맵/네이버맵/구글맵 중 뭘 쓸지
정해지면 그 자리에 iframe 또는 JS SDK로 교체하면 됩니다.

## 6. 백엔드 연동

아직 백엔드가 없어서 틀만 잡아둔 상태예요. 백엔드 주소가 생기면 이렇게 씁니다.

1. 페이지에서 목데이터 대신 `src/api/client.js`의 `request` 함수로 호출
   ```js
   import request from '../api/client';

   const places = await request('/places');
   ```
2. 배포 시에는 호스팅 플랫폼(Vercel/Netlify 등)의 환경변수 설정에
   `VITE_API_BASE_URL`을 프로덕션 백엔드 주소로 등록 (Vite가 빌드 시 자동으로 주입)
