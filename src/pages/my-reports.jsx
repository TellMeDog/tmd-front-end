import { Page, Navbar, List, ListItem } from 'framework7-react';

export default function MyReportsPage() {
  return (
    <Page name="my-reports">
      <Navbar title="내 방문 제보" backLink="뒤로" />
      <List strong insetIos dividersIos mediaList>
        <ListItem title="OO 공원" subtitle="입장했어요 · 2026-07-20" />
        <ListItem title="멍냥 카페" subtitle="조건이 달랐어요 · 2026-07-15" />
      </List>
    </Page>
  );
}
