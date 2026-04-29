import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import {
  LayoutDashboard, GitCompare, Package, DollarSign, HardHat,
} from 'lucide-react';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const { dbTokens } = useAuth();
  const { t } = useI18n();

  const items = [];

  if (dbTokens.cement) {
    items.push(
      { path: '/',                icon: LayoutDashboard, label: 'item.dashboard', end: true },
      { path: '/mill-production', icon: GitCompare,       label: 'item.mill_production' },
      { path: '/raw-materials-stock', icon: Package,      label: 'nav.rawmat' },
      { path: '/cost-summary',    icon: DollarSign,       label: 'nav.cost' },
    );
  } else if (dbTokens.shifer) {
    items.push(
      { path: '/shifer/production-performance', icon: HardHat,     label: 'item.production_performance' },
      { path: '/shifer/mill-production',        icon: GitCompare,  label: 'item.mill_production' },
      { path: '/shifer/raw-materials-stock',    icon: Package,     label: 'nav.rawmat' },
      { path: '/shifer/cost-summary',           icon: DollarSign,  label: 'nav.cost' },
    );
  } else if (dbTokens.jbi) {
    items.push(
      { path: '/jbi/mill-production',        icon: GitCompare, label: 'item.mill_production' },
      { path: '/jbi/raw-materials-stock',    icon: Package,    label: 'nav.rawmat' },
      { path: '/jbi/cost-summary',           icon: DollarSign, label: 'nav.cost' },
    );
  }

  if (!items.length) return null;

  return (
    <nav className={styles.nav}>
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
          >
            <Icon size={20} className={styles.icon} />
            <span className={styles.label}>{t(item.label)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
