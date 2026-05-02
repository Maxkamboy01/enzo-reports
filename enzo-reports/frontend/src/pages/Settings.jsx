import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { Globe, Database, CheckCircle, XCircle, LogOut, ChevronLeft, Key, Save, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Settings.module.css';

const LANGS = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿', desc: "Sayt tili o'zbek tiliga o'rnatiladi" },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺', desc: 'Язык сайта будет переключён на русский' },
  { code: 'en', label: 'English',   flag: '🇬🇧', desc: 'Website language will be set to English' },
];

export default function Settings() {
  const { lang, changeLang, t } = useI18n();
  const { user, dbTokens, DB_META, logout, setManualToken } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(null);
  const [tokenInputs, setTokenInputs] = useState({ cement: '', shifer: '', jbi: '' });
  const [saved, setSaved] = useState({});

  const handleSave = (db) => {
    const val = tokenInputs[db]?.trim();
    if (!val) return;
    setManualToken(db, val);
    setTokenInputs(p => ({ ...p, [db]: '' }));
    setSaved(p => ({ ...p, [db]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [db]: false })), 2000);
    setExpanded(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          {t('ui.back') || 'Орқага'}
        </button>
        <h1 className={styles.title}>{t('settings.title')}</h1>
        <p className={styles.sub}>{t('settings.sub') || 'Сайт созламалари'}</p>
      </div>

      {/* Language */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Globe size={18} className={styles.sectionIcon} />
          <div>
            <div className={styles.sectionTitle}>{t('settings.language')}</div>
            <div className={styles.sectionDesc}>{t('settings.lang_desc') || 'Интерфейс тилини танланг'}</div>
          </div>
        </div>
        <div className={styles.langGrid}>
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`${styles.langCard} ${lang === l.code ? styles.langCardActive : ''}`}
              onClick={() => changeLang(l.code)}
            >
              <span className={styles.flag}>{l.flag}</span>
              <div className={styles.langInfo}>
                <div className={styles.langName}>{l.label}</div>
                <div className={styles.langHint}>{l.desc}</div>
              </div>
              {lang === l.code && <CheckCircle size={18} className={styles.langCheck} />}
            </button>
          ))}
        </div>
      </div>

      {/* Connected databases + manual token */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Database size={18} className={styles.sectionIcon} />
          <div>
            <div className={styles.sectionTitle}>{t('settings.connected_dbs')}</div>
            <div className={styles.sectionDesc}>{t('token.hint')}</div>
          </div>
        </div>
        <div className={styles.dbList}>
          {Object.entries(DB_META).map(([db, meta]) => (
            <div key={db} className={styles.dbBlock}>
              <div className={styles.dbRow} style={{ '--db-color': meta.color }}>
                <span className={styles.dbDot} style={{ background: meta.color }} />
                <span className={styles.dbLabel}>{meta.label}</span>
                {dbTokens[db] || saved[db] ? (
                  <span className={styles.dbStatus} style={{ color: '#059669' }}>
                    <CheckCircle size={14} /> {saved[db] ? 'Saqlandi!' : t('token.connected')}
                  </span>
                ) : (
                  <span className={styles.dbStatus} style={{ color: '#9CA3AF' }}>
                    <XCircle size={14} /> {t('token.not_connected')}
                  </span>
                )}
                <button
                  className={styles.manualBtn}
                  onClick={() => setExpanded(expanded === db ? null : db)}
                  title="Token qo'lda kiritish"
                >
                  <Key size={13} />
                  {expanded === db ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {expanded === db && (
                <div className={styles.tokenBox}>
                  <p className={styles.tokenHint}>
                    Swagger yoki SAP B1 dan Bearer tokenni shu yerga kiriting
                  </p>
                  <div className={styles.tokenRow}>
                    <input
                      className={styles.tokenInput}
                      type="text"
                      placeholder="Bearer eyJ..."
                      value={tokenInputs[db]}
                      onChange={e => setTokenInputs(p => ({ ...p, [db]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleSave(db)}
                    />
                    <button
                      className={styles.saveBtn}
                      onClick={() => handleSave(db)}
                      disabled={!tokenInputs[db]?.trim()}
                    >
                      <Save size={14} />
                      Saqlash
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.avatar}>{(user?.name || 'A')[0].toUpperCase()}</div>
          <div>
            <div className={styles.sectionTitle}>{user?.name || 'Admin'}</div>
            <div className={styles.sectionDesc}>{user?.jobTitle || 'Administrator'}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={15} />
          {t('ui.logout')}
        </button>
      </div>

      <p className={styles.footer}>ENZO · BIS Consulting · v1.0</p>
    </div>
  );
}
