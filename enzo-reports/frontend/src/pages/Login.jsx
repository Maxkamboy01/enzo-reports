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

/* ── Isometric data illustration ── */
function DataIllustration() {
  const hw = 38, d = 19;
  const ox = 210, oy = 108;

  const PALETTE = {
    blue:   ['#5B7FE8','#2D52B0','#1B3A8C'],
    teal:   ['#26C9DC','#009AAC','#007282'],
    grey:   ['#E8F0FA','#BEC8D8','#94A3B8'],
    orange: ['#FCD34D','#F59E0B','#D97706'],
  };

  const cubes = [
    [0,0, 85,'blue'],
    [1,0, 28,'grey'],   [0,1, 22,'grey'],
    [2,0, 58,'teal'],   [1,1,108,'blue'],   [0,2, 62,'teal'],
    [3,0, 42,'orange'], [2,1, 48,'teal'],   [1,2, 22,'grey'],
    [3,1, 68,'blue'],   [2,2, 82,'blue'],
    [3,2, 32,'teal'],
  ];

  return (
    <svg viewBox="50 90 380 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      {cubes.map(([col, row, H, type], i) => {
        const cx = ox + (col - row) * hw;
        const cy = oy + (col + row) * d;
        const [topC, rightC, leftC] = PALETTE[type];
        return (
          <g key={i}>
            <polygon points={`${cx},${cy} ${cx+hw},${cy+d} ${cx},${cy+2*d} ${cx-hw},${cy+d}`} fill={topC}/>
            <polygon points={`${cx+hw},${cy+d} ${cx+hw},${cy+d+H} ${cx},${cy+2*d+H} ${cx},${cy+2*d}`} fill={rightC}/>
            <polygon points={`${cx-hw},${cy+d} ${cx},${cy+2*d} ${cx},${cy+2*d+H} ${cx-hw},${cy+d+H}`} fill={leftC}/>
          </g>
        );
      })}
    </svg>
  );
}

export default function Login() {
  const { login }         = useAuth();
  const { lang, changeLang } = useI18n();
  const navigate          = useNavigate();

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
      setError(err.message || 'Login failed. Please check your credentials.');
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
            Sign in to<br/>ENZO Analytics<br/>Dashboard
          </h1>
          <p className={styles.sub}>Grey Mix Sement Group · SAP B1 Analytics</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Employee Code</label>
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
              <label className={styles.label}>Password</label>
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
                ? <><Loader2 size={16} className={styles.spin}/> Signing in…</>
                : 'Sign in'}
            </button>
          </form>

          <p className={styles.footer}>© 2026 BIS Consulting. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right: illustration panel ── */}
      <div className={styles.right}>
        <div className={styles.rightContent}>
          <img src="/enzo-logo-brand.png" alt="ENZO" className={styles.enzoLogo} />
          <DataIllustration />
          <p className={styles.rightSub}>Analytics Portal · Powered by BIS Consulting®</p>
        </div>
      </div>

    </div>
  );
}
