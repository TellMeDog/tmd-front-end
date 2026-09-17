import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

export default function StarRating({ value, onChange, size = 20 }) {
  const interactive = typeof onChange === 'function';
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <span className={styles.rating} aria-label={`별점 ${value}점`}>
      {stars.map((score) => {
        const icon = <Star size={size} fill={score <= value ? 'currentColor' : 'none'} />;
        return interactive ? (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            aria-label={`${score}점`}
          >
            {icon}
          </button>
        ) : (
          <span key={score}>{icon}</span>
        );
      })}
    </span>
  );
}
