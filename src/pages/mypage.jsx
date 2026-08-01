import { Page, Navbar, NavRight, Link, Block, List, ListItem } from 'framework7-react';

import styles from './mypage.module.css';

export default function MyPage() {
  return (
    <Page name="mypage">
      <Navbar title="알려줄개">
        <NavRight>
          <Link iconIos="f7:bell" iconMd="f7:bell" />
        </NavRight>
      </Navbar>

      <Block strong className={`display-flex ${styles.profileRow}`}>
        <img src="https://picsum.photos/seed/dog/80/80" alt="반려동물" className={styles.avatar} />
        <div>
          <div>멍이 · 말티즈 · 3.5kg</div>
        </div>
      </Block>

      <List strong insetIos dividersIos>
        <ListItem link="/mypage/pets/" title="반려동물 관리" after=">" />
        <ListItem link="/bookmarks/" title="저장한 장소" after=">" />
        <ListItem link="/mypage/reports/" title="내 방문 제보" after=">" />
      </List>
    </Page>
  );
}
