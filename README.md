# 알려줄개 Frontend

반려동물 프로필과 장소별 동반 규정을 비교해 방문 가능 여부와 준비사항을 안내하는 반응형 웹 서비스입니다.

## 기술 스택

- React 19
- Vite
- React Router
- Lucide React
- CSS Modules 및 일반 CSS
- Pretendard Variable

## 실행

```bash
npm install
npm run dev
```

## 검사

```bash
npm run format
npm run lint
npm run build
```

## 주요 구조

```text
src/
├─ api/          # API 요청 함수
├─ app/          # 앱과 라우팅 설정
├─ assets/       # 폰트 등 번들 자산
├─ components/   # 공통 UI와 레이아웃
├─ mocks/        # API별 mock 데이터
├─ pages/        # 페이지 단위 기능
└─ styles/       # 전역 스타일과 디자인 토큰
```

현재는 mock API를 사용하며 인증 경로 보호와 Capacitor 연결은 서비스 UI 및 실제 API 연동 완료 후 적용합니다.
