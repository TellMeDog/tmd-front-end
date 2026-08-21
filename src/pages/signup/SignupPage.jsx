import { Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/icons/BrandLogo';
import { signup } from '../../api/auth.api';
import styles from '../shared/Auth.module.css';

const initialForm = { email: '', nickname: '', password: '', confirmPassword: '' };

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (Object.values(form).some((value) => !value)) return setError('모든 항목을 입력해 주세요.');
    if (form.password !== form.confirmPassword) return setError('비밀번호가 일치하지 않아요.');
    await signup(form);
    navigate('/login');
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
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                placeholder="example@email.com"
              />
            </div>
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
                  placeholder="8~16자 영문, 숫자, 특수문자"
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
            {error && <p className="field-error">{error}</p>}
            <button className="button button--primary" type="submit">
              가입하기
            </button>
          </form>
          <div className={styles.switch}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
