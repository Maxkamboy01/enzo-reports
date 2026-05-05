import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import styles from './Login.module.css';

const LANGS = [
  { code: 'uz', flag: '🇺🇿', label: "O'z" },
  { code: 'ru', flag: '🇷🇺', label: 'Рус' },
  { code: 'en', flag: '🇬🇧', label: 'En'  },
];

export default function Login() {
  const { login }            = useAuth();
  const { lang, changeLang, t } = useI18n();
  const navigate             = useNavigate();

  const [form,    setForm]    = useState({ employeeCode: '', externalEmployeeNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  const canSubmit = form.employeeCode.trim() && form.externalEmployeeNumber.trim() && !loading;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(''); setLoading(true);
    try {
      await login({ ...form, deviceId: 'web' });
      navigate('/hub');
    } catch (err) {
      setError(err.message || t('login.error_default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Left: form panel ── */}
      <div className={styles.left}>

        {/* Top row: BIS logo + lang switcher */}
        <div className={styles.topBar}>
          <img src="/bis-logo.png" alt="BIS Consulting" className={styles.bisLogo} />
          <div className={styles.langBar}>
            {LANGS.map(l => (
              <button
                key={l.code}
                className={`${styles.langBtn} ${lang === l.code ? styles.langActive : ''}`}
                onClick={() => changeLang(l.code)}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form area */}
        <div className={styles.formArea}>
          <h1 className={styles.heading}>
            {t('login.title')}<br/>ENZO Analytics<br/>Dashboard
          </h1>
          <p className={styles.sub}>Grey Mix Sement Group · SAP B1 Analytics</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>{t('login.employee_code')}</label>
              <input
                className={styles.input}
                type="text"
                value={form.employeeCode}
                onChange={set('employeeCode')}
                placeholder="Admin"
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('login.ext_number')}</label>
              <div className={styles.passWrap}>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  value={form.externalEmployeeNumber}
                  onChange={set('externalEmployeeNumber')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
              {loading
                ? <><Loader2 size={16} className={styles.spin}/> {t('login.loading_btn')}</>
                : t('login.submit')}
            </button>
          </form>

          <p className={styles.footer}>© 2026 BIS Consulting. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right: lockup panel ── */}
      <div className={styles.right}>
        <div className={styles.rightContent}>
          <img src="/bis-enzo-lockup.png" alt="BIS Consulting · ENZO" className={styles.lockupImg} />
          <p className={styles.rightSub}>Analytics Portal · Powered by BIS Consulting®</p>
        </div>
      </div>

    </div>
  );
}
