import { useState } from 'react';
import { TrendingUp, RefreshCw, Calendar, Users, FileText, DollarSign } from 'lucide-react';
import styles from './ModulePage.module.css';

const PERIODS = [
  { id: 'day', uz: 'Kun', ru: 'День', en: 'Day' },
  { id: 'week', uz: 'Hafta', ru: 'Неделя', en: 'Week' },
  { id: 'month', uz: 'Oy', ru: 'Месяц', en: 'Month' },
];

const STAT_CARDS = [
  { key: 'totalUSD', label: { uz: 'JAMI SOTUVLAR USD', ru: 'ИТОГО ПРОДАЖИ USD', en: 'TOTAL SALES USD' }, icon: DollarSign, color: '#059669', prefix: '$' },
  { key: 'totalUZS', label: { uz: 'JAMI SOTUVLAR UZS', ru: 'ИТОГО ПРОДАЖИ UZS', en: 'TOTAL SALES UZS' }, icon: TrendingUp, color: '#0891B2', prefix: '' },
  { key: 'invoices', label: { uz: 'HUJJATLAR', ru: 'НАКЛАДНЫХ', en: 'DOCUMENTS' }, icon: FileText, color: '#7C3AED', prefix: '' },
  { key: 'managers', label: { uz: 'MENEJERLAR', ru: 'МЕНЕДЖЕРОВ', en: 'MANAGERS' }, icon: Users, color: '#F59E0B', prefix: '' },
];

const MANAGER_COLS = [
  { key: 'manager', label: { uz: 'Menejer', ru: 'Менеджер', en: 'Manager' } },
  { key: 'totalUSD', label: { uz: 'Summa USD', ru: 'Сумма USD', en: 'Amount USD' }, right: true },
  { key: 'totalUZS', label: { uz: 'Summa UZS', ru: 'Сумма UZS', en: 'Amount UZS' }, right: true },
  { key: 'invoiceCount', label: { uz: 'Hujjatlar', ru: 'Накладных', en: 'Documents' }, right: true },
];

export default function SalesPage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [period, setPeriod] = useState('day');

  const title = { uz: 'Sotuvlar', ru: 'Продажи', en: 'Sales' }[l];
  const sub = { uz: "Menejerlar bo'yicha savdo hisoboti", ru: 'Отчёт менеджеров по продажам', en: 'Sales report by managers' }[l];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageSub}>{sub}</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.dateRange}>
            <Calendar size={13} className={styles.calIcon} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
            <span className={styles.dateSep}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={styles.dateInput} />
          </div>
          <div className={styles.periodTabs}>
            {PERIODS.map(p => (
              <button key={p.id} className={`${styles.periodBtn} ${period === p.id ? styles.periodActive : ''}`}
                onClick={() => setPeriod(p.id)}>{p[l]}</button>
            ))}
          </div>
          <button className={styles.refreshBtn}><RefreshCw size={13} /></button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {STAT_CARDS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} className={styles.statCard}>
              <div className={styles.statLabel} style={{ borderLeftColor: c.color }}>{c.label[l]}</div>
              <div className={styles.statValue}>—</div>
              <div className={styles.statIcon} style={{ background: c.color + '18', color: c.color }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#059669' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Sotuvlar USD', ru: 'Продажи USD', en: 'Sales USD' }[l]}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          <div className={styles.chartEmpty}>
            <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#059669' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Sotuvlar UZS', ru: 'Продажи UZS', en: 'Sales UZS' }[l]}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          <div className={styles.chartEmpty}>
            <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#1B3A8C' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Menejerlar ulushi · USD', ru: 'Доля менеджеров · USD', en: 'Manager share · USD' }[l]}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          <div className={styles.chartEmpty}>
            <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#1B3A8C' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Menejerlar ulushi · UZS', ru: 'Доля менеджеров · UZS', en: 'Manager share · UZS' }[l]}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          <div className={styles.chartEmpty}>
            <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <div>
            <div className={styles.tableCardTitle}>{ { uz: "Menejerlar bo'yicha hisobot", ru: 'Отчёт по менеджерам', en: 'Manager report' }[l]}</div>
            <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              {MANAGER_COLS.map(c => (
                <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label[l]}</th>
              ))}
            </tr></thead>
            <tbody>
              <tr><td colSpan={MANAGER_COLS.length} className={styles.emptyRow}>
                { { uz: 'Backend API ulanmoqda', ru: 'Подключение API...', en: 'Connecting API...' }[l]}
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
