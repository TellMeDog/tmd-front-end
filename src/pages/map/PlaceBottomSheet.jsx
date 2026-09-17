import { Heart, MapPin, Navigation, PawPrint, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { addFavorite, deleteFavorite } from '../../api/favorites.api';
import { getPlaceDetail } from '../../api/places.api';
import { useAuthStore } from '../../stores/auth.store';
import ReviewSection from '../../components/review/ReviewSection';
import { useDraggableSheet } from './useDraggableSheet';
import styles from './PlaceBottomSheet.module.css';

const STATUS_META = {
  available: { label: '입장 가능', tone: 'available' },
  conditional: { label: '조건부 가능', tone: 'conditional' },
  verify: { label: '확인 필요', tone: 'verify' },
  unknown: { label: '정보 없음', tone: 'unknown' },
};

const POLICY_FIELDS = [
  ['acmpyTypeCd', '동반 유형'],
  ['acmpyPsblCpam', '동반 가능 동물'],
  ['acmpyNeedMtr', '동반 시 필요사항'],
  ['relaAcdntRiskMtr', '안전사고 위험요소'],
  ['relaPosesFclty', '보유 시설'],
  ['relaFrnshPrdlst', '비치 제품'],
  ['relaPurcPrdlst', '구매 가능 품목'],
  ['relaRntlPrdlst', '대여 가능 품목'],
  ['etcAcmpyInfo', '기타 안내'],
];

export default function PlaceBottomSheet({ place, onClose, onHeightStateChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [detail, setDetail] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const { sheetRef, expanded, dragHeight, reset, dragHandlers } = useDraggableSheet(onClose, (isExpanded) =>
    onHeightStateChange?.(isExpanded ? 'full' : 'half'),
  );

  const fetchDetail = useCallback(() => {
    if (!place) return;
    getPlaceDetail(place.id, { mapX: place.lng, mapY: place.lat })
      .then(({ data }) => {
        setDetail(data);
        setIsFavorite(data?.placeMarkerResponse?.favorite ?? false);
      })
      .catch(() => setDetail(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id, place?.lat, place?.lng]);

  useEffect(() => {
    setDetail(null);
    setFavoriteError('');
    setIsFavorite(place?.favorite ?? false);
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id, place?.lat, place?.lng]);

  useEffect(() => {
    if (!place) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id]);

  const handleToggleFavorite = async () => {
    if (!place) return;
    if (!accessToken) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const nextFavorite = !isFavorite;
    setFavoriteError('');
    setIsFavoritePending(true);
    setIsFavorite(nextFavorite);
    try {
      if (nextFavorite) await addFavorite(place.id);
      else await deleteFavorite(place.id);
    } catch (requestError) {
      setIsFavorite(!nextFavorite);
      setFavoriteError(getApiErrorMessage(requestError, '즐겨찾기를 변경하지 못했습니다.'));
    } finally {
      setIsFavoritePending(false);
    }
  };

  if (!place) return null;
  const status = STATUS_META[place.status] ?? STATUS_META.unknown;
  const address = [detail?.addr1, detail?.addr2].filter(Boolean).join(' ');
  const policyRows = POLICY_FIELDS.map(([key, label]) => [label, detail?.petPolicyInfo?.[key]]).filter(
    ([, value]) => value,
  );
  const visitStats = detail?.visitStats;

  return (
    <section
      ref={sheetRef}
      className={`${styles.sheet} ${expanded ? styles.full : ''} ${dragHeight != null ? styles.dragging : ''}`}
      style={dragHeight != null ? { height: `${dragHeight}px` } : undefined}
      role="dialog"
      aria-label={`${place.name} 상세 정보`}
    >
      <div className={styles.header} {...dragHandlers}>
        <span className={styles.handle} />
        <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      <div className={styles.photo} data-tone={status.tone}>
        {place.image ? <img src={place.image} alt="" /> : <MapPin size={40} />}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {[place.category, place.distanceLabel, place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <h2>{place.name}</h2>
        <span className={`${styles.badge} ${styles[status.tone]}`}>{status.label}</span>

        {address && <p className={styles.address}>{address}</p>}

        {visitStats && (visitStats.enteredCount || visitStats.mismatchedCount || visitStats.deniedCount) && (
          <p className={styles.visitStats}>
            입장 성공 {visitStats.enteredCount} · 조건과 다름 {visitStats.mismatchedCount} · 거부{' '}
            {visitStats.deniedCount}
          </p>
        )}

        {policyRows.length > 0 && (
          <div className={styles.policy}>
            <b>
              <PawPrint size={16} />
              반려동반 정책
            </b>
            {policyRows.map(([label, value]) => (
              <p key={label}>
                <strong>{label}</strong>
                {value}
              </p>
            ))}
          </div>
        )}

        <ReviewSection
          reviews={detail?.reviews?.content ?? []}
          topBreeds={visitStats?.topBreeds}
          placeId={place.id}
          onReviewCreated={fetchDetail}
        />

        {favoriteError && <p className="field-error">{favoriteError}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={`button button--secondary ${styles.saveButton} ${isFavorite ? styles.saved : ''}`}
            onClick={handleToggleFavorite}
            disabled={isFavoritePending}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? '저장됨' : '즐겨찾기'}
          </button>
          <Link className="button button--primary" to={`/places/${place.id}`}>
            <Navigation size={18} />
            상세보기
          </Link>
        </div>
      </div>
    </section>
  );
}
