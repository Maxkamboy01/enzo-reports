import { Outlet, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import styles from './ModuleLayout.module.css';

export default function ModuleLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/hub')}>
          <ArrowLeft size={15} />
          <span>{{ uz: 'Modullar', ru: 'Модули', en: 'Modules' }[localStorage.getItem('enzo_lang') || 'uz']}</span>
        </button>
        <div className={styles.headerRight}>
          <Link to="/settings" className={styles.iconBtn} title="Settings">
            <Settings size={15} />
          </Link>
          <div className={styles.userPill}>
            <div className={styles.avatar}>{(user?.name || 'A')[0].toUpperCase()}</div>
            <span className={styles.userName}>{user?.name || 'Admin'}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={14} />
          </button>
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
