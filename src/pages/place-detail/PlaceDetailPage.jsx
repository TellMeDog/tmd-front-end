import { Check, Heart, MapPin, Navigation, PawPrint } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { places } from '../../mocks/data/places';
import styles from '../shared/ServiceFlows.module.css';
export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const place = places.find(({ id }) => id === Number(placeId)) ?? places[0];
  return (
    <main className="page">
      <div className={styles.detailGrid}>
        <div className={styles.cover}>
          <MapPin />
        </div>
        <section className={`card ${styles.detail}`}>
          <div className={styles.meta}>
            {place.category} · {place.area} · {place.distance}
          </div>
          <h1>{place.name}</h1>
          <div className={styles.verdict}>
            <span>
              <PawPrint size={20} />
            </span>
            <div>
              <small>멍이의 맞춤 판정</small>
              <strong>조건부 입장 가능해요</strong>
            </div>
          </div>
          <ul className={styles.list}>
            <li>
              <Check size={18} />
              야외 전 구역 동반 가능
            </li>
            <li>
              <Check size={18} />
              2m 이내 목줄 착용 필수
            </li>
            <li>
              <Check size={18} />
              배변 봉투 지참 필수
            </li>
          </ul>
          <div className={styles.source}>
            <b>공식 정보 원문</b>
            <p>반려견 동반 시 목줄 착용 및 배변 처리가 필요합니다.</p>
          </div>
          <div className={styles.actions}>
            <button className="button button--secondary">
              <Heart size={18} />
              즐겨찾기
            </button>
            <Link className="button button--primary" to={`/places/${place.id}/prep`}>
              <Navigation size={18} />
              방문 준비
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
