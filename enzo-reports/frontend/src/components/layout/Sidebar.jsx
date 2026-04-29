import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import {
  LayoutDashboard, Package, TrendingDown, TrendingUp, ArrowLeftRight,
  Database, Cog, GitCompare, Table2, LogOut, ChevronDown,
  Activity, Layers, AlertTriangle, DollarSign, FlaskConical,
  BarChart2, ArrowRightLeft, BookOpen, Zap, Scale, HardHat, FileBarChart,
  PanelLeftClose, PanelLeftOpen, Settings, Globe, X,
} from 'lucide-react';
import TokenManager from '../ui/TokenManager';
import styles from './Sidebar.module.css';

const SECTIONS = [
  {
    id: 'overview', label: null, db: null,
    items: [{ path: '/', label: 'item.dashboard', icon: LayoutDashboard, end: true }],
  },

  // ── CEMENT ───────────────────────────────────────
  { id: 'production', label: 'nav.production', color: '#1B3A8C', db: 'cement',
    items: [
      { path: '/mill-production',   label: 'item.mill_production',   icon: GitCompare },
      { path: '/volume-daily',      label: 'item.volume_daily',       icon: BarChart2 },
      { path: '/shift-performance', label: 'item.shift_performance',  icon: Zap },
    ],
  },
  { id: 'rawmat', label: 'nav.rawmat', color: '#D97706', db: 'cement',
    items: [
      { path: '/raw-materials-stock',        label: 'item.raw_materials_stock',        icon: Package },
      { path: '/raw-material-receipt',       label: 'item.raw_material_receipt',       icon: TrendingUp },
      { path: '/raw-material-consumption',   label: 'item.raw_material_consumption',   icon: TrendingDown },
      { path: '/raw-material-movement',      label: 'item.raw_material_movement',      icon: ArrowLeftRight },
      { path: '/raw-material-pivot',         label: 'item.raw_material_pivot',         icon: Table2 },
      { path: '/material-vs-bom',            label: 'item.material_vs_bom',            icon: Scale },
      { path: '/material-overconsumption',   label: 'item.material_overconsumption',   icon: AlertTriangle },
      { path: '/material-consumption-shift', label: 'item.material_consumption_shift', icon: Layers },
    ],
  },
  { id: 'silo', label: 'nav.silo', color: '#059669', db: 'cement',
    items: [
      { path: '/silo-stock',                  label: 'item.silo_stock',        icon: Database },
      { path: '/cement-consumption',          label: 'item.cement_consumption', icon: Cog },
      { path: '/cement-additive-composition', label: 'item.cement_additive',   icon: FlaskConical },
    ],
  },
  { id: 'clinker', label: 'nav.clinker', color: '#7C3AED', db: 'cement',
    items: [
      { path: '/clinker-factor',       label: 'item.clinker_factor', icon: Activity },
      { path: '/clinker-factor-trend', label: 'item.clinker_trend',  icon: TrendingDown },
    ],
  },
  { id: 'quality', label: 'nav.quality', color: '#DC2626', db: 'cement',
    items: [
      { path: '/defect-details', label: 'item.defect_details', icon: AlertTriangle },
    ],
  },
  { id: 'cost', label: 'nav.cost', color: '#0891B2', db: 'cement',
    items: [
      { path: '/cost-structure',     label: 'item.cost_structure',    icon: BookOpen },
      { path: '/cost-summary',       label: 'item.cost_summary',      icon: DollarSign },
      { path: '/cost-trend-monthly', label: 'item.cost_trend_monthly', icon: TrendingUp },
    ],
  },
  { id: 'inventory', label: 'nav.inventory', color: '#64748B', db: 'cement',
    items: [
      { path: '/inventory-transfer', label: 'item.inventory_transfer', icon: ArrowRightLeft },
    ],
  },

  // ── SHIFER ───────────────────────────────────────
  { id: 'shifer-overview', label: 'nav.shifer_overview', color: '#059669', db: 'shifer',
    items: [
      { path: '/shifer/production-performance', label: 'item.production_performance', icon: HardHat },
      { path: '/shifer/issue-materials',        label: 'item.issue_materials',        icon: FileBarChart },
    ],
  },
  { id: 'shifer-production', label: 'nav.shifer_production', color: '#059669', db: 'shifer',
    items: [
      { path: '/shifer/mill-production',   label: 'item.mill_production',  icon: GitCompare },
      { path: '/shifer/volume-daily',      label: 'item.volume_daily',      icon: BarChart2 },
      { path: '/shifer/shift-performance', label: 'item.shift_performance', icon: Zap },
    ],
  },
  { id: 'shifer-rawmat', label: 'nav.shifer_rawmat', color: '#D97706', db: 'shifer',
    items: [
      { path: '/shifer/raw-materials-stock',        label: 'item.raw_materials_stock',        icon: Package },
      { path: '/shifer/raw-material-receipt',       label: 'item.raw_material_receipt',       icon: TrendingUp },
      { path: '/shifer/raw-material-consumption',   label: 'item.raw_material_consumption',   icon: TrendingDown },
      { path: '/shifer/raw-material-movement',      label: 'item.raw_material_movement',      icon: ArrowLeftRight },
      { path: '/shifer/raw-material-pivot',         label: 'item.raw_material_pivot',         icon: Table2 },
      { path: '/shifer/material-vs-bom',            label: 'item.material_vs_bom',            icon: Scale },
      { path: '/shifer/material-overconsumption',   label: 'item.material_overconsumption',   icon: AlertTriangle },
      { path: '/shifer/material-consumption-shift', label: 'item.material_consumption_shift', icon: Layers },
    ],
  },

  // ── JBI ──────────────────────────────────────────
  { id: 'jbi-production', label: 'nav.jbi_production', color: '#7C3AED', db: 'jbi',
    items: [
      { path: '/jbi/mill-production', label: 'item.mill_production', icon: GitCompare },
      { path: '/jbi/volume-daily',    label: 'item.volume_daily',    icon: BarChart2 },
    ],
  },
  { id: 'jbi-rawmat', label: 'nav.jbi_rawmat', color: '#D97706', db: 'jbi',
    items: [
      { path: '/jbi/raw-materials-stock',        label: 'item.raw_materials_stock',        icon: Package },
      { path: '/jbi/raw-material-receipt',       label: 'item.raw_material_receipt',       icon: TrendingUp },
      { path: '/jbi/raw-material-consumption',   label: 'item.raw_material_consumption',   icon: TrendingDown },
      { path: '/jbi/raw-material-movement',      label: 'item.raw_material_movement',      icon: ArrowLeftRight },
      { path: '/jbi/raw-material-pivot',         label: 'item.raw_material_pivot',         icon: Table2 },
      { path: '/jbi/material-vs-bom',            label: 'item.material_vs_bom',            icon: Scale },
      { path: '/jbi/material-overconsumption',   label: 'item.material_overconsumption',   icon: AlertTriangle },
      { path: '/jbi/material-consumption-shift', label: 'item.material_consumption_shift', icon: Layers },
    ],
  },
  { id: 'jbi-silo', label: 'nav.jbi_silo', color: '#0891B2', db: 'jbi',
    items: [
      { path: '/jbi/silo-stock',                  label: 'item.silo_stock',        icon: Database },
      { path: '/jbi/cement-consumption',          label: 'item.cement_consumption', icon: Cog },
      { path: '/jbi/cement-additive-composition', label: 'item.cement_additive',   icon: FlaskConical },
    ],
  },
  { id: 'jbi-quality', label: 'nav.jbi_quality', color: '#DC2626', db: 'jbi',
    items: [
      { path: '/jbi/defect-details', label: 'item.defect_details', icon: AlertTriangle },
    ],
  },
  { id: 'jbi-cost', label: 'nav.jbi_cost', color: '#7C3AED', db: 'jbi',
    items: [
      { path: '/jbi/cost-structure',     label: 'item.cost_structure',    icon: BookOpen },
      { path: '/jbi/cost-summary',       label: 'item.cost_summary',      icon: DollarSign },
      { path: '/jbi/cost-trend-monthly', label: 'item.cost_trend_monthly', icon: TrendingUp },
    ],
  },
  { id: 'jbi-inventory', label: 'nav.jbi_inventory', color: '#64748B', db: 'jbi',
    items: [
      { path: '/jbi/inventory-transfer', label: 'item.inventory_transfer', icon: ArrowRightLeft },
    ],
  },
];

function SidebarSection({ section, collapsed }) {
  const { t } = useI18n();
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
              title={collapsed ? t(item.label) : undefined}
            >
              <Icon size={15} />
              {!collapsed && <span>{t(item.label)}</span>}
            </NavLink>
          );
        })}
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className={styles.collapsedSection}>
        {section.items.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.collapsedItem} ${isActive ? styles.collapsedActive : ''}`}
              style={({ isActive }) => isActive ? { '--s-color': section.color } : {}}
              title={t(item.label)}
            >
              <Icon size={15} />
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
        <span className={styles.sectionLabel}>{t(section.label)}</span>
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
                <span>{t(item.label)}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ onClose }) {
  const { lang, changeLang, t } = useI18n();
  const LANGS = [
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский',   flag: '🇷🇺' },
    { code: 'en', label: 'English',   flag: '🇬🇧' },
  ];
  return (
    <div className={styles.settingsPanel}>
      <div className={styles.settingsHeader}>
        <Globe size={14} />
        <span>{t('settings.language')}</span>
        <button className={styles.settingsClose} onClick={onClose}><X size={13} /></button>
      </div>
      <div className={styles.langList}>
        {LANGS.map(l => (
          <button
            key={l.code}
            className={`${styles.langBtn} ${lang === l.code ? styles.langActive : ''}`}
            onClick={() => { changeLang(l.code); onClose(); }}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, dbTokens } = useAuth();
  const { t } = useI18n();
  const [showSettings, setShowSettings] = useState(false);

  const visibleSections = SECTIONS.filter(s => !s.db || dbTokens[s.db]);

  const logoSub = dbTokens.cement && dbTokens.shifer && dbTokens.jbi ? 'Sement · Shifer · JBI'
    : dbTokens.cement && dbTokens.shifer ? 'Sement · Shifer'
    : dbTokens.cement && dbTokens.jbi    ? 'Sement · JBI'
    : dbTokens.shifer && dbTokens.jbi    ? 'Shifer · JBI'
    : dbTokens.shifer ? 'Shifer · Grey Mix'
    : dbTokens.jbi    ? 'JBI · Temir Beton'
    : 'Sement · Grey Mix';

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo + toggle */}
      <div className={styles.logoArea}>
        <div className={styles.logoMark}>E</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>ENZO</div>
            <div className={styles.logoSub}>{logoSub}</div>
          </div>
        )}
        <button
          className={styles.collapseBtn}
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {visibleSections.map(s => (
          <SidebarSection key={s.id} section={s} collapsed={collapsed} />
        ))}
      </nav>

      {/* DB status (hidden when collapsed) */}
      {!collapsed && (
        <div className={styles.tokenArea}>
          <TokenManager />
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userInfo} title={collapsed ? (user?.name || 'Admin') : undefined}>
          <div className={styles.avatar}>{(user?.name || 'A')[0].toUpperCase()}</div>
          {!collapsed && (
            <div className={styles.userText}>
              <div className={styles.userName}>{user?.name || 'Admin'}</div>
              <div className={styles.userRole}>{user?.jobTitle || 'Administrator'}</div>
            </div>
          )}
        </div>

        <div className={styles.footerActions}>
          <div className={styles.settingsWrap}>
            <button
              className={styles.iconBtn}
              onClick={() => setShowSettings(s => !s)}
              title={t('settings.title')}
            >
              <Settings size={14} />
            </button>
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          </div>
          <button
            className={`${styles.iconBtn} ${styles.logoutBtn}`}
            onClick={logout}
            title={t('ui.logout')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
