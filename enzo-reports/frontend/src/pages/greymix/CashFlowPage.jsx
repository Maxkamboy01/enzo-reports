import { useState } from 'react';
import { RefreshCw, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import styles from './ModulePage.module.css';

const KPI_CARDS = [
  { key: 'salesUSD', label: { uz: 'SOTUVLAR USD', ru: 'ПРОДАЖИ USD', en: 'SALES USD' }, icon: DollarSign, color: '#F59E0B' },
  { key: 'inUSD', label: { uz: 'KIRIM USD', ru: 'ВХОДЯЩИЕ USD', en: 'INCOMING USD' }, icon: TrendingUp, color: '#059669' },
  { key: 'outUSD', label: { uz: 'CHIQIM USD', ru: 'ИСХОДЯЩИЕ USD', en: 'OUTGOING USD' }, icon: TrendingDown, color: '#DC2626' },
  { key: 'salesUZS', label: { uz: 'SOTUVLAR UZS', ru: 'ПРОДАЖИ UZS', en: 'SALES UZS' }, icon: DollarSign, color: '#F59E0B' },
  { key: 'inUZS', label: { uz: 'KIRIM UZS', ru: 'ВХОДЯЩИЕ UZS', en: 'INCOMING UZS' }, icon: TrendingUp, color: '#059669' },
  { key: 'outUZS', label: { uz: 'CHIQIM UZS', ru: 'ИСХОДЯЩИЕ UZS', en: 'OUTGOING UZS' }, icon: TrendingDown, color: '#DC2626' },
];

const MANAGER_COLS = [
  { key: 'manager', label: { uz: 'Menejer', ru: 'Менеджер', en: 'Manager' } },
  { key: 'salesUSD', label: { uz: 'Sotuvlar USD', ru: 'Продажи USD', en: 'Sales USD' }, right: true },
  { key: 'inUSD', label: { uz: 'Kirim USD', ru: 'Вход. USD', en: 'In USD' }, right: true },
  { key: 'outUSD', label: { uz: 'Chiqim USD', ru: 'Исход. USD', en: 'Out USD' }, right: true },
  { key: 'salesUZS', label: { uz: 'Sotuvlar UZS', ru: 'Продажи UZS', en: 'Sales UZS' }, right: true },
  { key: 'inUZS', label: { uz: 'Kirim UZS', ru: 'Вход. UZS', en: 'In UZS' }, right: true },
  { key: 'outUZS', label: { uz: 'Chiqim UZS', ru: 'Исход. UZS', en: 'Out UZS' }, right: true },
];

export default function CashFlowPage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{ { uz: 'Pul oqimlari', ru: 'Денежные потоки', en: 'Cash Flow' }[l]}</h1>
          <p className={styles.pageSub}>{ { uz: "Menejerlar bo'yicha kirim va chiqim", ru: 'Входящие / Исходящие по менеджерам', en: 'Incoming & outgoing by managers' }[l]}</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.dateRange}>
            <Calendar size={13} className={styles.calIcon} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
            <span className={styles.dateSep}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={styles.dateInput} />
          </div>
          <button className={styles.refreshBtn}><RefreshCw size={13} /></button>
        </div>
      </div>

      <div className={styles.statsGrid6}>
        {KPI_CARDS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} className={styles.statCard}>
              <div className={styles.statLabel} style={{ borderLeftColor: c.color }}>{c.label[l]}</div>
              <div className={styles.statValue}>—</div>
              <div className={styles.statIcon} style={{ background: c.color + '18', color: c.color }}><Icon size={18} /></div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#059669' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Kirim va Chiqim · USD', ru: 'Входящие vs Исходящие · USD', en: 'Incoming vs Outgoing · USD' }[l]}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          <div className={styles.chartEmpty}>
            <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#F59E0B' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Sotuvlar · USD', ru: 'Продажи · USD', en: 'Sales · USD' }[l]}</div>
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
            <span className={styles.chartAccent} style={{ background: '#059669' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Kirim va Chiqim · UZS', ru: 'Входящие vs Исходящие · UZS', en: 'Incoming vs Outgoing · UZS' }[l]}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          <div className={styles.chartEmpty}>
            <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#F59E0B' }} />
            <div>
              <div className={styles.chartTitle}>{ { uz: 'Sotuvlar · UZS', ru: 'Продажи · UZS', en: 'Sales · UZS' }[l]}</div>
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
            <div className={styles.tableCardTitle}>{ { uz: "Menejerlar bo'yicha tahlil", ru: 'Детализация по менеджерам', en: 'Manager breakdown' }[l]}</div>
            <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              {MANAGER_COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label[l]}</th>)}
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
