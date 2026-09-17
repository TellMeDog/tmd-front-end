import { ArrowLeft, Heart, MapPin, Navigation, PawPrint } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { addFavorite, deleteFavorite } from '../../api/favorites.api';
import { getPlaceDetail, toPlace } from '../../api/places.api';
import ReviewSection from '../../components/review/ReviewSection';
import { PLACE_STATUS_META } from '../../constants/placeStatus';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useAuthStore } from '../../stores/auth.store';
import { usePetStore } from '../../stores/pet.store';
import styles from './PlaceDetailPage.module.css';

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

// 마커를 눌렀을 때(PlaceBottomSheet)는 가벼운 미리보기만 보여주고,
// 실제 상세 정보(리뷰/정책/방문 통계 등) 조회는 이 페이지에서만 함
export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { location: currentLocation } = useCurrentLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  // 반려동물 목록이 로그인 직후 비동기로 로드되므로, 상세 페이지 첫 진입 시
  // 아직 로드되기 전이면 petId 없이 조회돼 상태가 "정보 없음"으로 보일 수 있어
  // petId가 뒤늦게 채워지면 다시 조회되도록 의존성에 포함
  const petId = selectedPetId ?? pets[0]?.petId;

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  const fetchDetail = () => {
    if (!currentLocation) return;
    setError('');
    getPlaceDetail(placeId, { mapX: currentLocation.lng, mapY: currentLocation.lat, petId })
      .then(({ data }) => {
        setDetail(data);
        setIsFavorite(data?.placeMarkerResponse?.favorite ?? false);
      })
      .catch((requestError) => {
        setDetail(null);
        setError(getApiErrorMessage(requestError, '장소 정보를 불러오지 못했습니다.'));
      });
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, currentLocation, petId]);

  const handleToggleFavorite = async () => {
    if (!accessToken) {
      navigate('/login', { state: { from: `/places/${placeId}` } });
      return;
    }

    const nextFavorite = !isFavorite;
    setFavoriteError('');
    setIsFavoritePending(true);
    setIsFavorite(nextFavorite);
    try {
      if (nextFavorite) await addFavorite(placeId);
      else await deleteFavorite(placeId);
    } catch (requestError) {
      setIsFavorite(!nextFavorite);
      setFavoriteError(getApiErrorMessage(requestError, '즐겨찾기를 변경하지 못했습니다.'));
    } finally {
      setIsFavoritePending(false);
    }
  };

  if (error) {
    return (
      <main className="page simple-status">
        <p>{error}</p>
        <button type="button" className="button button--secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          돌아가기
        </button>
      </main>
    );
  }

  if (!detail) {
    return <main className="page simple-status">장소 정보를 불러오는 중이에요...</main>;
  }

  const place = toPlace(detail.placeMarkerResponse, null);
  const status = PLACE_STATUS_META[place.status] ?? PLACE_STATUS_META.unknown;
  const address = [detail.addr1, detail.addr2].filter(Boolean).join(' ');
  const policyRows = POLICY_FIELDS.map(([key, label]) => [label, detail.petPolicyInfo?.[key]]).filter(
    ([, value]) => value,
  );
  const visitStats = detail.visitStats;

  return (
    <main className="page">
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        뒤로
      </button>

      <div className={styles.photo} data-tone={status.tone}>
        {place.image ? <img src={place.image} alt="" /> : <MapPin size={48} />}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {[place.distanceLabel, place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <h1>{place.name}</h1>
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
          <Link className="button button--primary" to={`/places/${placeId}/prep`}>
            <Navigation size={18} />
            방문 준비
          </Link>
        </div>

        <ReviewSection placeId={placeId} topBreeds={visitStats?.topBreeds} onReviewCreated={fetchDetail} />
      </div>
    </main>
  );
}
