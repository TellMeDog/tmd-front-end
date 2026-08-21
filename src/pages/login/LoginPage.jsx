import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/icons/BrandLogo';
import { login } from '../../api/auth.api';
import styles from '../shared/Auth.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    await login(form);
    navigate('/');
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <BrandLogo />
        <div className={styles.brandContent}>
          <span className="eyebrow">WELCOME BACK</span>
          <h1>
            멍이와의 다음 외출을
            <br />
            계속 준비해 볼까요?
          </h1>
          <p>
            장소 조건과 필요한 준비물을 미리 확인해
            <br />
            걱정 없는 시간을 만들어 보세요.
          </p>
          <div className={styles.brandNote}>
            <span>01</span>
            <p>내 반려견 기준으로 장소 조건을 한눈에 확인해요.</p>
          </div>
        </div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.mobileLogo}>
          <BrandLogo />
        </div>
        <div className={styles.formWrap}>
          <h2>로그인</h2>
          <p>알려줄개에 다시 오신 것을 환영해요.</p>
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
              <label htmlFor="password">비밀번호</label>
              <div className={styles.password}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update}
                  placeholder="비밀번호를 입력해 주세요"
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
            {error && <p className="field-error">{error}</p>}
            <button className="button button--primary" type="submit">
              로그인
            </button>
          </form>
          <div className={styles.switch}>
            아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
