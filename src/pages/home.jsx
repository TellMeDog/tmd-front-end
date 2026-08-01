import { Page, Navbar, NavTitle, Block, Searchbar, List, ListItem, Card, CardContent } from 'framework7-react';

import PawIcon from '../components/PawIcon';
import styles from './home.module.css';

const recommended = [
  { id: 'p1', name: 'OO 공원', tag: '조건부 가능', image: 'https://picsum.photos/seed/park/300/200' },
  { id: 'p2', name: '멍냥 카페', tag: '입장 가능', image: 'https://picsum.photos/seed/cafe/300/200' },
  { id: 'p3', name: '포근 호텔', tag: '조건부 가능', image: 'https://picsum.photos/seed/hotel/300/200' },
];

export default function HomePage() {
  return (
    <Page name="home">
      <Navbar>
        <NavTitle className={styles.navTitle}>
          <PawIcon className={`text-color-primary ${styles.logoIcon}`} />
          <h1 className="text-color-primary">알려줄개</h1>
        </NavTitle>
      </Navbar>

      <Block strong>
        <h2 className="no-margin-top">멍이와 갈 수 있는 곳</h2>
        <Searchbar disableButton={false} placeholder="어디로 떠나시나요?" />
      </Block>

      <Block strong className={`display-flex ${styles.categoryButtons}`}>
        <a href="#" className="button button-fill button-round">
          관광지
        </a>
        <a href="#" className="button button-outline button-round">
          음식점
        </a>
        <a href="#" className="button button-outline button-round">
          숙박
        </a>
      </Block>

      <Block strongIos outlineIos>
        <p className="text-color-gray">추천 장소</p>
        <div className="grid grid-cols-3 grid-gap">
          {recommended.map((place) => (
            <Card key={place.id} href={`/place/${place.id}/`}>
              <img src={place.image} alt={place.name} className={styles.placeImage} />
              <CardContent>
                <div className="text-color-black">{place.name}</div>
                <div className={`text-color-orange ${styles.placeTag}`}>
                  {place.tag}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Block>
    </Page>
  );
}
