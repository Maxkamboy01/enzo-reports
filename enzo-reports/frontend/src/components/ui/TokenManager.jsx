import { Database, CheckCircle, AlertCircle, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './TokenManager.module.css';

export default function TokenManager() {
  const { dbTokens, DB_META, clearDbToken } = useAuth();
  const [open, setOpen] = useState(false);

  const connectedCount = Object.values(dbTokens).filter(Boolean).length;
  const total = Object.keys(DB_META).length;

  return (
    <div className={styles.wrap}>
      <button className={styles.trigger} onClick={() => setOpen(o => !o)}>
        <Database size={13} />
        <span>Базалар</span>
        <span className={`${styles.badge} ${
          connectedCount === total ? styles.full :
          connectedCount > 0      ? styles.partial : styles.none
        }`}>{connectedCount}/{total}</span>
        <ChevronDown size={11} className={`${styles.chev} ${open ? styles.chevOpen : ''}`} />
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Уланган базалар</div>
            {Object.entries(DB_META).map(([db, meta]) => {
              const ok = dbTokens[db];
              return (
                <div key={db} className={styles.row}>
                  <span className={styles.dot} style={{ background: meta.color }} />
                  <span className={styles.label}>{meta.label}</span>
                  {ok
                    ? <>
                        <span className={styles.ok}><CheckCircle size={12} /> Уланган</span>
                        <button className={styles.clear} onClick={() => clearDbToken(db)} title="Узиш">
                          <LogOut size={12} />
                        </button>
                      </>
                    : <span className={styles.no}><AlertCircle size={12} /> Yo'q</span>
                  }
                </div>
              );
            })}
            <p className={styles.hint}>Логин саҳифасида кириш орқали барча базалар автоматик аниқланади</p>
          </div>
        </>
      )}
    </div>
  );
}
