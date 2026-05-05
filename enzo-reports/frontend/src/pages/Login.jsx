import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Loader2, Database, Hash, User, Globe, Key, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import styles from './Login.module.css';

const LANG_OPTIONS = [
  { code: 'uz', label: "O'z", full: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Рус', full: 'Русский',   flag: '🇷🇺' },
  { code: 'en', label: 'En',  full: 'English',   flag: '🇬🇧' },
];

export default function Login() {
  const { login, setManualToken, DB_META } = useAuth();
  const { t, lang, changeLang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({ employeeCode: '', externalEmployeeNumber: '', deviceId: 'web' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual token state
  const [showManual, setShowManual] = useState(false);
  const [manualDb, setManualDb] = useState(null);
  const [manualToken, setManualToken_] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.employeeCode.trim() || !form.externalEmployeeNumber.trim()) return;
    setError(''); setLoading(true);
    try {
      await login(form);
      navigate('/hub');
    } catch (err) {
      setError(err.message || t('login.error_default'));
      setShowManual(true); // Auto-open manual token section on failure
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = (db) => {
    const token = manualToken.trim().replace(/^Bearer\s+/i, '');
    if (!token || !token.startsWith('eyJ')) return;
    setManualLoading(true);
    setManualToken(db, token);
    setTimeout(() => navigate('/hub'), 100);
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
        {/* Language switcher */}
        <div className={styles.langBar}>
          <Globe size={13} style={{ color: 'var(--grey-400)' }} />
          {LANG_OPTIONS.map(l => (
            <button
              key={l.code}
              className={`${styles.langBtn} ${lang === l.code ? styles.langActive : ''}`}
              onClick={() => changeLang(l.code)}
              title={l.full}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Database size={26} color="var(--primary)" />
            <h2>{t('login.title')}</h2>
            <p>{t('login.subtitle')}</p>
          </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label><User size={12} style={{ display:'inline', marginRight:4 }} />{t('login.employee_code')}</label>
                  <input type="text" value={form.employeeCode} onChange={set('employeeCode')}
                    placeholder="Admin" autoComplete="username" autoFocus disabled={loading} />
                </div>

                <div className={styles.field}>
                  <label><Hash size={12} style={{ display:'inline', marginRight:4 }} />{t('login.ext_number')}</label>
                  <input type="password" value={form.externalEmployeeNumber} onChange={set('externalEmployeeNumber')}
                    placeholder="••••••••" autoComplete="current-password" disabled={loading} />
                  <span className={styles.fieldHint}>{t('login.ext_hint')}</span>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {loading && (
                  <div className={styles.checking}>
                    <Loader2 size={14} className={styles.spin} />
                    {t('login.checking')}
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
                  {loading
                    ? <><Loader2 size={15} className={styles.spin} /> {t('login.loading_btn')}</>
                    : t('login.submit')}
                </button>
              </form>

              {/* Manual token section — always visible */}
              <div className={styles.manualSection}>
                  <button
                    className={styles.manualToggle}
                    onClick={() => setShowManual(s => !s)}
                  >
                    <Key size={13} />
                    Tokenni qo'lda kiritish (Swagger)
                    {showManual ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {showManual && (
                    <div className={styles.manualBody}>
                      <p className={styles.manualHint}>
                        Swagger yoki SAP B1 dan olgan Bearer tokeningizni kiriting
                      </p>
                      <div className={styles.dbButtons}>
                        {Object.entries(DB_META).map(([db, meta]) => (
                          <button
                            key={db}
                            className={`${styles.dbSelectBtn} ${manualDb === db ? styles.dbSelectActive : ''}`}
                            style={{ '--db-color': meta.color }}
                            onClick={() => { setManualDb(db); setManualToken_(''); }}
                          >
                            <span className={styles.dbDot2} style={{ background: meta.color }} />
                            {meta.label}
                          </button>
                        ))}
                      </div>

                      {manualDb && (
                        <div className={styles.manualInput}>
                          <textarea
                            className={styles.tokenArea}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            value={manualToken}
                            onChange={e => setManualToken_(e.target.value)}
                            rows={3}
                          />
                          <button
                            className={styles.manualEnterBtn}
                            onClick={() => handleManualLogin(manualDb)}
                            disabled={!manualToken.trim() || manualLoading}
                          >
                            {manualLoading
                              ? <Loader2 size={14} className={styles.spin} />
                              : <LogIn size={14} />
                            }
                            {DB_META[manualDb]?.label} ga kirish
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

          <p className={styles.footer}>BIS Consulting · Grey Mix Sement Group</p>

        </div>
      </div>
    </div>
  );
}
