import { useLocation } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import styles from './Header.module.css';

const PAGE_KEYS = {
  '/': 'item.dashboard',
  '/mill-production':             'item.mill_production',
  '/volume-daily':                'item.volume_daily',
  '/shift-performance':           'item.shift_performance',
  '/raw-materials-stock':         'item.raw_materials_stock',
  '/raw-material-receipt':        'item.raw_material_receipt',
  '/raw-material-consumption':    'item.raw_material_consumption',
  '/raw-material-movement':       'item.raw_material_movement',
  '/raw-material-pivot':          'item.raw_material_pivot',
  '/material-vs-bom':             'item.material_vs_bom',
  '/material-overconsumption':    'item.material_overconsumption',
  '/material-consumption-shift':  'item.material_consumption_shift',
  '/silo-stock':                  'item.silo_stock',
  '/cement-consumption':          'item.cement_consumption',
  '/cement-additive-composition': 'item.cement_additive',
  '/clinker-factor':              'item.clinker_factor',
  '/clinker-factor-trend':        'item.clinker_trend',
  '/defect-details':              'item.defect_details',
  '/cost-structure':              'item.cost_structure',
  '/cost-summary':                'item.cost_summary',
  '/cost-trend-monthly':          'item.cost_trend_monthly',
  '/inventory-transfer':          'item.inventory_transfer',
  '/shifer/production-performance': 'item.production_performance',
  '/shifer/issue-materials':        'item.issue_materials',
  '/shifer/mill-production':        'item.mill_production',
  '/shifer/volume-daily':           'item.volume_daily',
  '/shifer/shift-performance':      'item.shift_performance',
  '/shifer/raw-materials-stock':    'item.raw_materials_stock',
  '/shifer/raw-material-receipt':   'item.raw_material_receipt',
  '/shifer/raw-material-consumption': 'item.raw_material_consumption',
  '/shifer/raw-material-movement':  'item.raw_material_movement',
  '/shifer/raw-material-pivot':     'item.raw_material_pivot',
  '/shifer/material-vs-bom':        'item.material_vs_bom',
  '/shifer/material-overconsumption': 'item.material_overconsumption',
  '/shifer/material-consumption-shift': 'item.material_consumption_shift',
  '/shifer/silo-stock':             'item.silo_stock',
  '/shifer/cement-consumption':     'item.cement_consumption',
  '/shifer/cement-additive-composition': 'item.cement_additive',
  '/shifer/clinker-factor':         'item.clinker_factor',
  '/shifer/clinker-factor-trend':   'item.clinker_trend',
  '/shifer/defect-details':         'item.defect_details',
  '/shifer/cost-structure':         'item.cost_structure',
  '/shifer/cost-summary':           'item.cost_summary',
  '/shifer/cost-trend-monthly':     'item.cost_trend_monthly',
  '/shifer/inventory-transfer':     'item.inventory_transfer',
  '/jbi/mill-production':           'item.mill_production',
  '/jbi/volume-daily':              'item.volume_daily',
  '/jbi/raw-materials-stock':       'item.raw_materials_stock',
  '/jbi/raw-material-receipt':      'item.raw_material_receipt',
  '/jbi/raw-material-consumption':  'item.raw_material_consumption',
  '/jbi/raw-material-movement':     'item.raw_material_movement',
  '/jbi/raw-material-pivot':        'item.raw_material_pivot',
  '/jbi/material-vs-bom':           'item.material_vs_bom',
  '/jbi/material-overconsumption':  'item.material_overconsumption',
  '/jbi/material-consumption-shift': 'item.material_consumption_shift',
  '/jbi/silo-stock':                'item.silo_stock',
  '/jbi/cement-consumption':        'item.cement_consumption',
  '/jbi/cement-additive-composition': 'item.cement_additive',
  '/jbi/defect-details':            'item.defect_details',
  '/jbi/cost-structure':            'item.cost_structure',
  '/jbi/cost-summary':              'item.cost_summary',
  '/jbi/cost-trend-monthly':        'item.cost_trend_monthly',
  '/jbi/inventory-transfer':        'item.inventory_transfer',
};

const SECTION_KEYS = {
  '/mill-production':             'nav.production',
  '/volume-daily':                'nav.production',
  '/shift-performance':           'nav.production',
  '/raw-materials-stock':         'nav.rawmat',
  '/raw-material-receipt':        'nav.rawmat',
  '/raw-material-consumption':    'nav.rawmat',
  '/raw-material-movement':       'nav.rawmat',
  '/raw-material-pivot':          'nav.rawmat',
  '/material-vs-bom':             'nav.rawmat',
  '/material-overconsumption':    'nav.rawmat',
  '/material-consumption-shift':  'nav.rawmat',
  '/silo-stock':                  'nav.silo',
  '/cement-consumption':          'nav.silo',
  '/cement-additive-composition': 'nav.silo',
  '/clinker-factor':              'nav.clinker',
  '/clinker-factor-trend':        'nav.clinker',
  '/defect-details':              'nav.quality',
  '/cost-structure':              'nav.cost',
  '/cost-summary':                'nav.cost',
  '/cost-trend-monthly':          'nav.cost',
  '/inventory-transfer':          'nav.inventory',
  '/shifer/production-performance': 'nav.shifer_overview',
  '/shifer/issue-materials':        'nav.shifer_overview',
  '/shifer/mill-production':        'nav.shifer_production',
  '/shifer/volume-daily':           'nav.shifer_production',
  '/shifer/shift-performance':      'nav.shifer_production',
  '/shifer/raw-materials-stock':    'nav.shifer_rawmat',
  '/shifer/raw-material-receipt':   'nav.shifer_rawmat',
  '/shifer/raw-material-consumption': 'nav.shifer_rawmat',
  '/shifer/raw-material-movement':  'nav.shifer_rawmat',
  '/shifer/raw-material-pivot':     'nav.shifer_rawmat',
  '/shifer/material-vs-bom':        'nav.shifer_rawmat',
  '/shifer/material-overconsumption': 'nav.shifer_rawmat',
  '/shifer/material-consumption-shift': 'nav.shifer_rawmat',
  '/shifer/silo-stock':             'nav.silo',
  '/shifer/cement-consumption':     'nav.silo',
  '/shifer/cement-additive-composition': 'nav.silo',
  '/shifer/clinker-factor':         'nav.clinker',
  '/shifer/clinker-factor-trend':   'nav.clinker',
  '/shifer/defect-details':         'nav.quality',
  '/shifer/cost-structure':         'nav.cost',
  '/shifer/cost-summary':           'nav.cost',
  '/shifer/cost-trend-monthly':     'nav.cost',
  '/shifer/inventory-transfer':     'nav.inventory',
  '/jbi/mill-production':           'nav.jbi_production',
  '/jbi/volume-daily':              'nav.jbi_production',
  '/jbi/raw-materials-stock':       'nav.jbi_rawmat',
  '/jbi/raw-material-receipt':      'nav.jbi_rawmat',
  '/jbi/raw-material-consumption':  'nav.jbi_rawmat',
  '/jbi/raw-material-movement':     'nav.jbi_rawmat',
  '/jbi/raw-material-pivot':        'nav.jbi_rawmat',
  '/jbi/material-vs-bom':           'nav.jbi_rawmat',
  '/jbi/material-overconsumption':  'nav.jbi_rawmat',
  '/jbi/material-consumption-shift': 'nav.jbi_rawmat',
  '/jbi/silo-stock':                'nav.jbi_silo',
  '/jbi/cement-consumption':        'nav.jbi_silo',
  '/jbi/cement-additive-composition': 'nav.jbi_silo',
  '/jbi/defect-details':            'nav.jbi_quality',
  '/jbi/cost-structure':            'nav.jbi_cost',
  '/jbi/cost-summary':              'nav.jbi_cost',
  '/jbi/cost-trend-monthly':        'nav.jbi_cost',
  '/jbi/inventory-transfer':        'nav.jbi_inventory',
};

export default function Header({ onMenuOpen, sidebarW }) {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();

  const pageKey = PAGE_KEYS[location.pathname];
  const sectionKey = SECTION_KEYS[location.pathname];
  const page = pageKey ? t(pageKey) : 'Dashboard';
  const section = sectionKey ? t(sectionKey) : null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className={styles.header} style={{ '--header-left': (sidebarW ?? 240) + 'px' }}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={onMenuOpen} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <nav className={styles.breadcrumb}>
          <span className={styles.breadHome}>ENZO</span>
          <ChevronRight size={13} className={styles.sep} />
          {section && (
            <>
              <span className={styles.breadSection}>{section}</span>
              <ChevronRight size={13} className={styles.sep} />
            </>
          )}
          <span className={styles.breadCurrent}>{page}</span>
        </nav>
      </div>

      <div className={styles.right}>
        <span className={styles.date}>{dateStr}</span>
        <div className={styles.userChip}>
          <div className={styles.avatar}>{(user?.name || 'A')[0].toUpperCase()}</div>
          <span className={styles.userName}>{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
