import { PawPrint, Star } from 'lucide-react';
import { withSubjectParticle } from '../../utils/korean';
import styles from './ReviewSection.module.css';

const TAG_META = [
  { key: 'fit', label: '잘 맞아요', tone: 'fit' },
  { key: 'different', label: '조건과 달랐어요', tone: 'different' },
  { key: 'rejected', label: '거부 당했어요', tone: 'rejected' },
];

function formatDate(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getTopBreed(reviewList) {
  const counts = reviewList.reduce((acc, review) => {
    acc[review.breed] = (acc[review.breed] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export default function ReviewSection({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles.section}>
        <h3 className={styles.heading}>리뷰</h3>
        <p className={styles.empty}>아직 등록된 리뷰가 없어요.</p>
      </div>
    );
  }

  const counts = reviews.reduce((acc, review) => {
    acc[review.tag] = (acc[review.tag] ?? 0) + 1;
    return acc;
  }, {});
  const recentDate = reviews.reduce((latest, review) => (review.date > latest ? review.date : latest), reviews[0].date);
  const topBreed = getTopBreed(reviews);

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>리뷰</h3>

      <div className={styles.tags}>
        {TAG_META.map((meta) => (
          <span key={meta.key} className={`${styles.tag} ${styles[meta.tone]}`}>
            {meta.label} <b>{counts[meta.key] ?? 0}</b>
          </span>
        ))}
      </div>

      <p className={styles.recent}>최근 리뷰 {formatDate(recentDate)}</p>

      {topBreed && (
        <p className={styles.insight}>
          <PawPrint size={14} />
          {withSubjectParticle(topBreed)} 많이 방문했어요
        </p>
      )}

      <ul className={styles.list}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.item}>
            <div className={styles.thumb}>
              <PawPrint size={20} />
            </div>
            <div className={styles.itemBody}>
              <div className={styles.itemHead}>
                <span className={styles.nickname}>{review.nickname}</span>
                <span className={styles.stars} aria-label={`별점 ${review.rating}점`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={12} fill={index < review.rating ? 'currentColor' : 'none'} />
                  ))}
                </span>
              </div>
              <span className={styles.date}>{formatDate(review.date)}</span>
              <p className={styles.text}>{review.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
