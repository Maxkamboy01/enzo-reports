import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import styles from './Login.module.css';

/* ── BIS Consulting logo mark ── */
function BISMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#009EAF"/>
      <text x="20" y="26" textAnchor="middle" fill="white"
        fontSize="14" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.5">
        BIS
      </text>
      <text x="34" y="13" fill="white" fontSize="6" fontFamily="Arial, sans-serif">®</text>
    </svg>
  );
}

/* ── ENZO brand logo ── */
function ENZOBrand() {
  return (
    <svg width="168" height="52" viewBox="0 0 168 52" fill="none">
      {/* 3 stacked slab bars with slight right offset (perspective) */}
      <rect x="0"  y="2"  width="42" height="11" rx="2.5" fill="#1B3A8C"/>
      <rect x="4"  y="19" width="42" height="11" rx="2.5" fill="#1B3A8C"/>
      <rect x="8"  y="36" width="42" height="11" rx="2.5" fill="#1B3A8C"/>
      {/* ENZO text */}
      <text x="60" y="43" fill="#1B3A8C" fontSize="38" fontWeight="900"
        fontFamily="Arial, sans-serif" letterSpacing="2">ENZO</text>
    </svg>
  );
}

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

  // [col, row, height, palette] — ordered back-to-front (ascending col+row)
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
            {/* Top face */}
            <polygon
              points={`${cx},${cy} ${cx+hw},${cy+d} ${cx},${cy+2*d} ${cx-hw},${cy+d}`}
              fill={topC}
            />
            {/* Right face */}
            <polygon
              points={`${cx+hw},${cy+d} ${cx+hw},${cy+d+H} ${cx},${cy+2*d+H} ${cx},${cy+2*d}`}
              fill={rightC}
            />
            {/* Left face */}
            <polygon
              points={`${cx-hw},${cy+d} ${cx},${cy+2*d} ${cx},${cy+2*d+H} ${cx-hw},${cy+d+H}`}
              fill={leftC}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Main Login component ── */
export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

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

      {/* BIS logo — absolute top-left */}
      <div className={styles.bisCorner}>
        <BISMark />
        <span className={styles.bisLabel}>BIS Consulting</span>
      </div>

      {/* ── Left: form panel ── */}
      <div className={styles.left}>
        <div className={styles.formArea}>

          <h1 className={styles.heading}>
            Sign in to<br/>ENZO Analytics<br/>Dashboard
          </h1>
          <p className={styles.sub}>
            Grey Mix Sement Group · SAP B1 Analytics
          </p>

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
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw(s => !s)}
                  tabIndex={-1}
                >
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
        </div>
      </div>

      {/* ── Right: illustration panel ── */}
      <div className={styles.right}>
        <div className={styles.rightContent}>
          <ENZOBrand />
          <DataIllustration />
          <p className={styles.rightSub}>Analytics Portal · Powered by BIS Consulting®</p>
        </div>
      </div>

    </div>
  );
}
