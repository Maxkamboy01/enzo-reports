import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const PAGES = {
  '/': 'Асосий панель',
  '/mill-production':             'Тегирмон ишлаб чиқариши',
  '/volume-daily':                'Кунлик ишлаб чиқариш ҳажми',
  '/shift-performance':           'Смена кўрсаткичлари',
  '/raw-materials-stock':         'Хом ашё қолдиқлари',
  '/raw-material-receipt':        'Хом ашё кириши',
  '/raw-material-consumption':    'Хом ашё сарфи',
  '/raw-material-movement':       'Хом ашё ҳаракати',
  '/raw-material-pivot':          'Пивот жадвал',
  '/material-vs-bom':             'Материал vs BOM',
  '/material-overconsumption':    'Ортиқча материал сарфи',
  '/material-consumption-shift':  'Смена бўйича материал сарфи',
  '/silo-stock':                  'Силос қолдиқлари',
  '/cement-consumption':          'Цемент сарфи',
  '/cement-additive-composition': 'Цемент қўшимчалари таркиби',
  '/clinker-factor':              'Клинкер омил',
  '/clinker-factor-trend':        'Клинкер омил тренди',
  '/defect-details':              'Нуқсон тафсилоти',
  '/cost-structure':              'Харажат структураси',
  '/cost-summary':                'Харажат хулосаси',
  '/cost-trend-monthly':          'Ойлик харажат тренди',
  '/inventory-transfer':                'Омбор ўтказма сўровлари',
  '/shifer/production-performance':     'Ишлаб чиқариш ҳисоботи',
  '/shifer/issue-materials':            'Материал чиқими',
};

const SECTIONS = {
  '/mill-production':             'Ишлаб чиқариш',
  '/volume-daily':                'Ишлаб чиқариш',
  '/shift-performance':           'Ишлаб чиқариш',
  '/raw-materials-stock':         'Хом ашё',
  '/raw-material-receipt':        'Хом ашё',
  '/raw-material-consumption':    'Хом ашё',
  '/raw-material-movement':       'Хом ашё',
  '/raw-material-pivot':          'Хом ашё',
  '/material-vs-bom':             'Хом ашё',
  '/material-overconsumption':    'Хом ашё',
  '/material-consumption-shift':  'Хом ашё',
  '/silo-stock':                  'Силос & Цемент',
  '/cement-consumption':          'Силос & Цемент',
  '/cement-additive-composition': 'Силос & Цемент',
  '/clinker-factor':              'Клинкер',
  '/clinker-factor-trend':        'Клинкер',
  '/defect-details':              'Сифат назорати',
  '/cost-structure':              'Харажатлар',
  '/cost-summary':                'Харажатлар',
  '/cost-trend-monthly':          'Харажатлар',
  '/inventory-transfer':                'Омбор',
  '/shifer/production-performance':     'Шифер · Grey Mix',
  '/shifer/issue-materials':            'Шифер · Grey Mix',
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const page = PAGES[location.pathname] || 'Dashboard';
  const section = SECTIONS[location.pathname];

  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className={styles.header}>
      <div className={styles.left}>
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
          <span>{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
