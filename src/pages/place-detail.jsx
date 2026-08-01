import { Page, Navbar, NavRight, Link, Block, BlockTitle, List, ListItem, f7 } from 'framework7-react';

import styles from './place-detail.module.css';

export default function PlaceDetailPage({ f7route }) {
  const { id } = f7route.params;

  return (
    <Page name="place-detail">
      <Navbar title="장소 상세" backLink="뒤로">
        <NavRight>
          <Link iconIos="f7:heart" iconMd="f7:heart" />
        </NavRight>
      </Navbar>

      <div className={styles.heroImageWrap}>
        <img src={`https://picsum.photos/seed/${id}/600/400`} alt="장소 대표 이미지" className={styles.heroImage} />
      </div>

      <BlockTitle large>
        OO 공원 <span className={`chip color-orange ${styles.statusChip}`}>조건부 입장 가능</span>
      </BlockTitle>

      <List strong insetIos dividersIos>
        <ListItem link title="판정 이유" after=">" />
        <ListItem link title="공식 정보 원문" after=">" />
      </List>

      <Block className={`display-flex ${styles.actionRow}`}>
        <Link
          href={`/place/${id}/prep/`}
          className={`button button-outline button-round ${styles.actionButton}`}
        >
          준비목록에 담기
        </Link>
        <Link href={`/place/${id}/report/`} className={`button button-fill button-round ${styles.actionButton}`}>
          길찾기 / 방문 제보
        </Link>
      </Block>
    </Page>
  );
}
