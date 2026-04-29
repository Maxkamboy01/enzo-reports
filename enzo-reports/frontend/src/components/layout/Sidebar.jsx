import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, TrendingDown, TrendingUp, ArrowLeftRight,
  Database, Cog, GitCompare, Table2, LogOut, ChevronDown,
  Activity, Layers, AlertTriangle, DollarSign, FlaskConical,
  BarChart2, ArrowRightLeft, BookOpen, Zap, Scale, HardHat, FileBarChart,
} from 'lucide-react';
import TokenManager from '../ui/TokenManager';
import styles from './Sidebar.module.css';

// db: which database this section belongs to (null = always visible)
const SECTIONS = [
  {
    id: 'overview',
    label: null,
    db: null,
    items: [
      { path: '/', label: 'Асосий панель', icon: LayoutDashboard, end: true },
    ],
  },

  // ── CEMENT sections ──────────────────────────────
  {
    id: 'production',
    label: 'Ишлаб чиқариш',
    color: '#1B3A8C',
    db: 'cement',
    items: [
      { path: '/mill-production',   label: 'Тегирмон ишлаб чиқариши', icon: GitCompare },
      { path: '/volume-daily',      label: 'Кунлик ҳажм',              icon: BarChart2 },
      { path: '/shift-performance', label: 'Смена кўрсаткичлари',       icon: Zap },
    ],
  },
  {
    id: 'rawmat',
    label: 'Хом ашё',
    color: '#D97706',
    db: 'cement',
    items: [
      { path: '/raw-materials-stock',        label: 'Қолдиқлар',         icon: Package },
      { path: '/raw-material-receipt',       label: 'Кириш',              icon: TrendingUp },
      { path: '/raw-material-consumption',   label: 'Сарф',               icon: TrendingDown },
      { path: '/raw-material-movement',      label: 'Ҳаракат',            icon: ArrowLeftRight },
      { path: '/raw-material-pivot',         label: 'Пивот жадвал',       icon: Table2 },
      { path: '/material-vs-bom',            label: 'vs BOM',             icon: Scale },
      { path: '/material-overconsumption',   label: 'Ортиқча сарф',       icon: AlertTriangle },
      { path: '/material-consumption-shift', label: 'Смена бўйича сарф',  icon: Layers },
    ],
  },
  {
    id: 'silo',
    label: 'Силос & Цемент',
    color: '#059669',
    db: 'cement',
    items: [
      { path: '/silo-stock',                  label: 'Силос қолдиқлари',   icon: Database },
      { path: '/cement-consumption',          label: 'Цемент сарфи',       icon: Cog },
      { path: '/cement-additive-composition', label: 'Қўшимчалар таркиби', icon: FlaskConical },
    ],
  },
  {
    id: 'clinker',
    label: 'Клинкер',
    color: '#7C3AED',
    db: 'cement',
    items: [
      { path: '/clinker-factor',       label: 'Клинкер омил', icon: Activity },
      { path: '/clinker-factor-trend', label: 'Омил тренди',  icon: TrendingDown },
    ],
  },
  {
    id: 'quality',
    label: 'Сифат назорати',
    color: '#DC2626',
    db: 'cement',
    items: [
      { path: '/defect-details', label: 'Нуқсон тафсилоти', icon: AlertTriangle },
    ],
  },
  {
    id: 'cost',
    label: 'Харажатлар',
    color: '#0891B2',
    db: 'cement',
    items: [
      { path: '/cost-structure',     label: 'Харажат структураси', icon: BookOpen },
      { path: '/cost-summary',       label: 'Харажат хулосаси',    icon: DollarSign },
      { path: '/cost-trend-monthly', label: 'Ойлик тренд',         icon: TrendingUp },
    ],
  },
  {
    id: 'inventory',
    label: 'Омбор',
    color: '#64748B',
    db: 'cement',
    items: [
      { path: '/inventory-transfer', label: 'Ўтказма сўровлари', icon: ArrowRightLeft },
    ],
  },

  // ── SHIFER sections ──────────────────────────────
  {
    id: 'shifer-overview',
    label: 'Шифер · Умумий',
    color: '#059669',
    db: 'shifer',
    items: [
      { path: '/shifer/production-performance', label: 'Ишлаб чиқариш ҳисоботи', icon: HardHat },
      { path: '/shifer/issue-materials',        label: 'Материал чиқими',         icon: FileBarChart },
    ],
  },
  {
    id: 'shifer-production',
    label: 'Шифер · Ишлаб чиқариш',
    color: '#059669',
    db: 'shifer',
    items: [
      { path: '/shifer/mill-production',   label: 'Тегирмон ишлаб чиқариши', icon: GitCompare },
      { path: '/shifer/volume-daily',      label: 'Кунлик ҳажм',              icon: BarChart2 },
      { path: '/shifer/shift-performance', label: 'Смена кўрсаткичлари',       icon: Zap },
    ],
  },
  {
    id: 'shifer-rawmat',
    label: 'Шифер · Хом ашё',
    color: '#D97706',
    db: 'shifer',
    items: [
      { path: '/shifer/raw-materials-stock',        label: 'Қолдиқлар',         icon: Package },
      { path: '/shifer/raw-material-receipt',       label: 'Кириш',              icon: TrendingUp },
      { path: '/shifer/raw-material-consumption',   label: 'Сарф',               icon: TrendingDown },
      { path: '/shifer/raw-material-movement',      label: 'Ҳаракат',            icon: ArrowLeftRight },
      { path: '/shifer/raw-material-pivot',         label: 'Пивот жадвал',       icon: Table2 },
      { path: '/shifer/material-vs-bom',            label: 'vs BOM',             icon: Scale },
      { path: '/shifer/material-overconsumption',   label: 'Ортиқча сарф',       icon: AlertTriangle },
      { path: '/shifer/material-consumption-shift', label: 'Смена бўйича сарф',  icon: Layers },
    ],
  },
  {
    id: 'shifer-silo',
    label: 'Шифер · Силос & Цемент',
    color: '#0891B2',
    db: 'shifer',
    items: [
      { path: '/shifer/silo-stock',                  label: 'Силос қолдиқлари',   icon: Database },
      { path: '/shifer/cement-consumption',          label: 'Цемент сарфи',       icon: Cog },
      { path: '/shifer/cement-additive-composition', label: 'Қўшимчалар таркиби', icon: FlaskConical },
    ],
  },
  {
    id: 'shifer-clinker',
    label: 'Шифер · Клинкер',
    color: '#7C3AED',
    db: 'shifer',
    items: [
      { path: '/shifer/clinker-factor',       label: 'Клинкер омил', icon: Activity },
      { path: '/shifer/clinker-factor-trend', label: 'Омил тренди',  icon: TrendingDown },
    ],
  },
  {
    id: 'shifer-quality',
    label: 'Шифер · Сифат',
    color: '#DC2626',
    db: 'shifer',
    items: [
      { path: '/shifer/defect-details', label: 'Нуқсон тафсилоти', icon: AlertTriangle },
    ],
  },
  {
    id: 'shifer-cost',
    label: 'Шифер · Харажатлар',
    color: '#1B3A8C',
    db: 'shifer',
    items: [
      { path: '/shifer/cost-structure',     label: 'Харажат структураси', icon: BookOpen },
      { path: '/shifer/cost-summary',       label: 'Харажат хулосаси',    icon: DollarSign },
      { path: '/shifer/cost-trend-monthly', label: 'Ойлик тренд',         icon: TrendingUp },
    ],
  },
  {
    id: 'shifer-inventory',
    label: 'Шифер · Омбор',
    color: '#64748B',
    db: 'shifer',
    items: [
      { path: '/shifer/inventory-transfer', label: 'Ўтказма сўровлари', icon: ArrowRightLeft },
    ],
  },
];

function SidebarSection({ section }) {
  const location = useLocation();
  const hasActive = section.items.some(i =>
    i.end ? location.pathname === i.path
           : location.pathname === i.path || location.pathname.startsWith(i.path + '/')
  );
  const [open, setOpen] = useState(hasActive || section.id === 'overview');

  if (!section.label) {
    return (
      <div className={styles.plainSection}>
        {section.items.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <button
        className={`${styles.sectionBtn} ${hasActive ? styles.sectionBtnActive : ''}`}
        onClick={() => setOpen(o => !o)}
        style={hasActive ? { '--s-color': section.color } : {}}
      >
        <span className={styles.sectionDot} style={{ background: section.color }} />
        <span className={styles.sectionLabel}>{section.label}</span>
        <ChevronDown size={12} className={`${styles.sectionChev} ${open ? styles.chevOpen : ''}`} />
      </button>

      {open && (
        <div className={styles.subNav}>
          {section.items.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `${styles.subItem} ${isActive ? styles.subActive : ''}`}
                style={({ isActive }) => isActive ? { '--s-color': section.color } : {}}
              >
                <Icon size={13} className={styles.subIcon} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout, dbTokens } = useAuth();

  // Only show sections the user has access to
  const visibleSections = SECTIONS.filter(s => !s.db || dbTokens[s.db]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoMark}>E</div>
        <div>
          <div className={styles.logoTitle}>ENZO</div>
          <div className={styles.logoSub}>
            {dbTokens.cement && dbTokens.shifer ? 'Sement · Shifer'
             : dbTokens.shifer ? 'Shifer · Grey Mix'
             : 'Sement · Grey Mix'}
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {visibleSections.map(s => <SidebarSection key={s.id} section={s} />)}
      </nav>

      <div className={styles.tokenArea}>
        <TokenManager />
      </div>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{(user?.name || 'A')[0].toUpperCase()}</div>
          <div>
            <div className={styles.userName}>{user?.name || 'Admin'}</div>
            <div className={styles.userRole}>{user?.jobTitle || 'Administrator'}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Чиқиш">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
