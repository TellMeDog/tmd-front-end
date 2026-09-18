import { Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/icons/BrandLogo';
import { sendVerificationCode, signup, verifyEmail } from '../../api/auth.api';
import { getApiErrorMessage } from '../../api/client';
import FeedbackModal from '../../components/feedback/FeedbackModal';
import { PRIVACY_CONSENT_TEXT, TERMS_OF_SERVICE_TEXT } from '../../constants/legalTerms';
import styles from '../shared/Auth.module.css';

const initialForm = { email: '', nickname: '', password: '', confirmPassword: '' };
const VERIFICATION_DURATION_SECONDS = 5 * 60;
const AGREEMENT_ITEMS = [
  { key: 'terms', label: '[필수] 이용약관 동의', text: TERMS_OF_SERVICE_TEXT },
  { key: 'privacy', label: '[필수] 개인정보 수집 및 이용 동의', text: PRIVACY_CONSENT_TEXT },
];
const initialAgreements = { terms: false, privacy: false };

function formatRemainingTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [notice, setNotice] = useState(null);
  const [verificationExpiresAt, setVerificationExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [agreements, setAgreements] = useState(initialAgreements);
  const [openAgreementKey, setOpenAgreementKey] = useState(null);
  const isCodeExpired = verificationSent && !emailVerified && remainingSeconds === 0;
  const allAgreed = AGREEMENT_ITEMS.every((item) => agreements[item.key]);

  const toggleAgreement = (key) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
    setError('');
  };

  const toggleAllAgreements = () => {
    const nextValue = !allAgreed;
    setAgreements(
      Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, nextValue])),
    );
    setError('');
  };

  useEffect(() => {
    if (!verificationExpiresAt || emailVerified) return undefined;

    const updateRemainingTime = () => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((verificationExpiresAt - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemainingSeconds);
      if (nextRemainingSeconds === 0) window.clearInterval(intervalId);
    };

    const intervalId = window.setInterval(updateRemainingTime, 1000);
    updateRemainingTime();
    return () => window.clearInterval(intervalId);
  }, [emailVerified, verificationExpiresAt]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    if (name === 'email') {
      setCode('');
      setVerificationSent(false);
      setEmailVerified(false);
      setVerificationExpiresAt(null);
      setRemainingSeconds(0);
    }
    setError('');
  };

  const sendCode = async () => {
    if (!form.email) return setError('이메일을 입력해 주세요.');
    setPendingAction('send');
    setError('');
    try {
      await sendVerificationCode(form.email);
      setCode('');
      setVerificationSent(true);
      setEmailVerified(false);
      setRemainingSeconds(VERIFICATION_DURATION_SECONDS);
      setVerificationExpiresAt(Date.now() + VERIFICATION_DURATION_SECONDS * 1000);
      setNotice({
        tone: 'brand',
        title: '인증번호를 보냈어요',
        description: `${form.email}로 전송된 인증번호를 5분 안에 입력해 주세요.`,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '인증번호 발송에 실패했습니다.'));
    } finally {
      setPendingAction('');
    }
  };

  const checkCode = async () => {
    if (!code) return setError('인증번호를 입력해 주세요.');
    if (isCodeExpired) return setError('인증 시간이 만료되었습니다. 인증번호를 재발송해 주세요.');
    setPendingAction('verify');
    setError('');
    try {
      await verifyEmail(form.email, code);
      setEmailVerified(true);
      setNotice({
        tone: 'success',
        title: '이메일 인증 완료',
        description: '이제 나머지 정보를 입력하고 회원가입을 완료해 주세요.',
      });
    } catch (requestError) {
      setEmailVerified(false);
      setError(getApiErrorMessage(requestError, '이메일 인증에 실패했습니다.'));
    } finally {
      setPendingAction('');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (Object.values(form).some((value) => !value)) return setError('모든 항목을 입력해 주세요.');
    if (!emailVerified) return setError('이메일 인증을 완료해 주세요.');
    if (form.password !== form.confirmPassword) return setError('비밀번호가 일치하지 않아요.');
    if (!allAgreed) return setError('이용약관과 개인정보 수집·이용에 동의해 주세요.');
    setPendingAction('signup');
    try {
      await signup(form);
      localStorage.setItem('tmd:nickname', form.nickname.trim());
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '회원가입에 실패했습니다.'));
    } finally {
      setPendingAction('');
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <BrandLogo />
        <div className={styles.brandContent}>
          <span className="eyebrow">JOIN US</span>
          <h1>
            멍이에게 딱 맞는 장소를
            <br />
            함께 찾아드릴게요.
          </h1>
          <p>
            프로필을 등록하면 장소마다 다른 조건을
            <br />
            멍이 기준으로 쉽게 알려드려요.
          </p>
          <ul className={styles.benefits}>
            <li>
              <Check size={16} />
              맞춤 출입 가능 여부
            </li>
            <li>
              <Check size={16} />
              방문 준비 체크리스트
            </li>
            <li>
              <Check size={16} />
              즐겨찾기와 방문 제보
            </li>
          </ul>
        </div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.mobileLogo}>
          <BrandLogo />
        </div>
        <div className={styles.formWrap}>
          <h2>회원가입</h2>
          <p>간단한 정보로 알려줄개를 시작해 보세요.</p>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="email">이메일</label>
              <div className={styles.inlineField}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="example@email.com"
                  disabled={emailVerified}
                />
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={pendingAction !== '' || emailVerified}
                >
                  {verificationSent ? '재발송' : '인증번호 받기'}
                </button>
              </div>
            </div>
            {verificationSent && (
              <div className="field">
                <label htmlFor="verificationCode">인증번호</label>
                <div className={styles.inlineField}>
                  <div className={styles.verificationInput}>
                    <input
                      id="verificationCode"
                      inputMode="numeric"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value);
                        setEmailVerified(false);
                        setError('');
                      }}
                      placeholder="6자리 인증번호"
                      disabled={emailVerified || isCodeExpired}
                    />
                    <span
                      className={`${styles.timer} ${isCodeExpired ? styles.expired : ''} ${emailVerified ? styles.verified : ''}`}
                      aria-live="polite"
                    >
                      {emailVerified
                        ? '인증 완료'
                        : isCodeExpired
                          ? '시간 만료'
                          : formatRemainingTime(remainingSeconds)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={checkCode}
                    disabled={pendingAction !== '' || emailVerified || isCodeExpired}
                  >
                    {emailVerified ? '인증 완료' : '확인'}
                  </button>
                </div>
                <p className={`${styles.verificationGuide} ${isCodeExpired ? styles.expired : ''}`}>
                  {isCodeExpired
                    ? '인증 시간이 만료되었어요. 위의 재발송 버튼을 눌러주세요.'
                    : '인증번호는 발송 후 5분 동안 유효해요.'}
                </p>
              </div>
            )}
            <div className="field">
              <label htmlFor="nickname">닉네임</label>
              <input
                id="nickname"
                name="nickname"
                value={form.nickname}
                onChange={update}
                placeholder="사용할 닉네임을 입력해 주세요"
              />
            </div>
            <div className="field">
              <label htmlFor="password">비밀번호</label>
              <div className={styles.password}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update}
                  placeholder="8~16자 영문 대소문자, 숫자, 특수문자"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="비밀번호 표시 전환"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={update}
                placeholder="비밀번호를 다시 입력해 주세요"
              />
            </div>
            <div className={styles.agreements}>
              <label className={styles.agreementAll}>
                <input type="checkbox" checked={allAgreed} onChange={toggleAllAgreements} />
                <span className={styles.agreementCheckbox} aria-hidden="true">
                  {allAgreed && <Check size={14} strokeWidth={3} />}
                </span>
                <b>약관 전체 동의</b>
              </label>
              <ul className={styles.agreementList}>
                {AGREEMENT_ITEMS.map((item) => {
                  const isOpen = openAgreementKey === item.key;
                  return (
                    <li key={item.key}>
                      <div className={styles.agreementRow}>
                        <label>
                          <input
                            type="checkbox"
                            checked={agreements[item.key]}
                            onChange={() => toggleAgreement(item.key)}
                          />
                          <span className={styles.agreementCheckbox} aria-hidden="true">
                            {agreements[item.key] && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span>{item.label}</span>
                        </label>
                        <button
                          type="button"
                          className={styles.agreementToggle}
                          aria-expanded={isOpen}
                          onClick={() => setOpenAgreementKey(isOpen ? null : item.key)}
                        >
                          보기
                          <ChevronDown
                            size={16}
                            style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                          />
                        </button>
                      </div>
                      {isOpen && <pre className={styles.agreementText}>{item.text}</pre>}
                    </li>
                  );
                })}
              </ul>
            </div>
            {error && <p className="field-error">{error}</p>}
            <button
              className="button button--primary"
              type="submit"
              disabled={pendingAction !== '' || !allAgreed}
            >
              {pendingAction === 'signup' ? '가입 중...' : '가입하기'}
            </button>
          </form>
          <div className={styles.switch}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </div>
      </section>
      <FeedbackModal
        open={Boolean(notice)}
        tone={notice?.tone}
        title={notice?.title}
        description={notice?.description}
        onClose={() => setNotice(null)}
      />
    </main>
  );
}
