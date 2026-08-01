import { Page, Navbar, NavRight, Link, Segmented, Button, Block } from 'framework7-react';

import styles from './map.module.css';

export default function MapPage() {
  return (
    <Page name="map">
      <Navbar title="지도">
        <NavRight>
          <Link iconIos="f7:slider_horizontal_3" iconMd="f7:slider_horizontal_3" />
        </NavRight>
      </Navbar>

      <Block strong>
        <Segmented strong tag="p" round>
          <Button active>전체</Button>
          <Button>관광지</Button>
          <Button>음식점</Button>
        </Segmented>
      </Block>

      {/* TODO: 실제 지도(SDK) 컴포넌트로 교체 – 카카오맵/네이버맵/구글맵 등 */}
      <Block className={styles.mapPlaceholder}>지도 영역 (지도 SDK 연동 예정)</Block>

      <Block strong>
        <Link href="/place/p1/" className="button button-fill button-round">
          OO 공원 상세보기
        </Link>
      </Block>
    </Page>
  );
}
