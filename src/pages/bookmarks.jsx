import { Page, Navbar, List, ListItem } from 'framework7-react';

export default function BookmarksPage() {
  return (
    <Page name="bookmarks">
      <Navbar title="즐겨찾기" />
      <List strong insetIos dividersIos mediaList>
        <ListItem link="/place/p1/" title="OO 공원" subtitle="조건부 가능" />
        <ListItem link="/place/p2/" title="멍냥 카페" subtitle="입장 가능" />
      </List>
    </Page>
  );
}
