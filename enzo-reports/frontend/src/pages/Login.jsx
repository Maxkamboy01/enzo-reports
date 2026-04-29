import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, Database, Hash, User, ArrowRight } from 'lucide-react';
import styles from './Login.module.css';

const DB_HOME = {
  cement: '/',
  shifer: '/shifer/production-performance',
  jbi:    '/jbi/mill-production',
};

export default function Login() {
  const { login, DB_META } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employeeCode: '',
    externalEmployeeNumber: '',
    deviceId: 'web',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detected, setDetected] = useState(null); // null | string[]

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.employeeCode.trim() || !form.externalEmployeeNumber.trim()) return;
    setError('');
    setLoading(true);
    setDetected(null);
    try {
      const result = await login(form);
      if (result.databases.length === 1) {
        // Only one DB matched — go straight in
        navigate(DB_HOME[result.databases[0]] ?? '/');
      } else {
        // Multiple DBs — show picker
        setDetected(result.databases);
      }
    } catch (err) {
      setError(err.message || 'Логин муваффақиятсиз. Маълумотларни текширинг.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.employeeCode.trim() && form.externalEmployeeNumber.trim() && !loading;

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>E</div>
          <h1 className={styles.brand}>ENZO</h1>
          <p className={styles.brandSub}>Ишлаб чиқариш мониторинг тизими</p>

          <div className={styles.dbList}>
            {Object.entries(DB_META).map(([db, meta]) => (
              <div key={db} className={styles.dbItem}>
                <span className={styles.dbDot} style={{ background: meta.color }} />
                <span>{meta.label}</span>
              </div>
            ))}
          </div>

          <p className={styles.leftHint}>
            Бир кириш орқали барча SAP B1 базалари автоматик аниқланади
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.card}>

          {/* ── DB picker (shown after multi-DB login) ── */}
          {detected ? (
            <>
              <div className={styles.cardHeader}>
                <CheckCircle size={26} color="#059669" />
                <h2>Базани танланг</h2>
                <p>Қайси интерфейсга кириш кераклигини танланг</p>
              </div>

              <div className={styles.dbPicker}>
                {detected.map(db => {
                  const meta = DB_META[db];
                  return (
                    <button
                      key={db}
                      className={styles.dbPickBtn}
                      style={{ '--db-color': meta.color }}
                      onClick={() => navigate(DB_HOME[db] ?? '/')}
                    >
                      <span className={styles.dbPickDot} style={{ background: meta.color }} />
                      <span className={styles.dbPickLabel}>{meta.label}</span>
                      <ArrowRight size={16} className={styles.dbPickArrow} />
                    </button>
                  );
                })}
              </div>

              <p className={styles.footer}>BIS Consulting · Grey Mix Sement Group</p>
            </>
          ) : (
            <>
              <div className={styles.cardHeader}>
                <Database size={26} color="var(--primary)" />
                <h2>Tizimga kirish</h2>
                <p>SAP B1 xodim ma'lumotlari</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label>
                    <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Employee Code
                  </label>
                  <input
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
                  <label>
                    <Hash size={12} style={{ display: 'inline', marginRight: 4 }} />
                    External Employee Number
                  </label>
                  <input
                    type="password"
                    value={form.externalEmployeeNumber}
                    onChange={set('externalEmployeeNumber')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <span className={styles.fieldHint}>Swagger'даги «externalEmployeeNumber» қиймати</span>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {loading && (
                  <div className={styles.checking}>
                    <Loader2 size={14} className={styles.spin} />
                    Барча базалар текширилмоқда...
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
                  {loading
                    ? <><Loader2 size={15} className={styles.spin} /> Кутинг...</>
                    : 'Kirish'}
                </button>
              </form>

              <p className={styles.footer}>BIS Consulting · Grey Mix Sement Group</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
