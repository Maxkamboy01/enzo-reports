import { useState } from 'react';
import { RefreshCw, Calendar, TrendingUp, TrendingDown, BarChart2, Percent } from 'lucide-react';
import styles from './ModulePage.module.css';

export default function PnlPage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);

  const kpiCards = [
    { key: 'income', label: { uz: 'DAROMADLAR (USD)', ru: 'ДОХОДЫ (USD)', en: 'REVENUE (USD)' }, icon: TrendingUp, color: '#059669' },
    { key: 'expenses', label: { uz: 'XARAJATLAR (USD)', ru: 'РАСХОДЫ (USD)', en: 'EXPENSES (USD)' }, icon: TrendingDown, color: '#DC2626' },
    { key: 'result', label: { uz: "NATIJA (USD)", ru: 'РЕЗУЛЬТАТ (USD)', en: 'RESULT (USD)' }, icon: BarChart2, color: '#0891B2' },
    { key: 'margin', label: { uz: 'RENTABELLIK', ru: 'РЕНТАБЕЛЬНОСТЬ', en: 'PROFITABILITY' }, icon: Percent, color: '#7C3AED' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{ { uz: "Foyda va zarar hisoboti (P&L)", ru: 'Отчёт о прибылях и убытках (P&L)', en: 'Profit & Loss Report (P&L)' }[l]}</h1>
          <p className={styles.pageSub}>{ { uz: "Daromadlar, xarajatlar va moliyaviy natija", ru: 'Доходы, расходы и финансовый результат периода', en: 'Revenue, expenses and financial result' }[l]}</p>
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

      <div className={styles.statsGrid}>
        {kpiCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} className={styles.statCard}>
              <div className={styles.statLabel} style={{ borderLeftColor: c.color }}>{c.label[l]}</div>
              <div className={styles.statValue}>—</div>
              <div className={styles.statIcon} style={{ background: c.color + '18', color: c.color }}><Icon size={20} /></div>
            </div>
          );
        })}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.chartHeader} style={{ padding: '16px 20px 8px' }}>
          <span className={styles.chartAccent} style={{ background: '#0891B2' }} />
          <div>
            <div className={styles.chartTitle}>{ { uz: 'P&L hisoboti (USD)', ru: 'Отчёт P&L (USD)', en: 'P&L Report (USD)' }[l]}</div>
            <div className={styles.chartSub}>{ { uz: "Oylik dinamika", ru: 'Помесячная динамика доходов, расходов и результата', en: 'Monthly revenue, expenses & result' }[l]}</div>
          </div>
        </div>
        <div className={styles.chartEmpty} style={{ height: 220 }}>
          <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <div>
            <div className={styles.tableCardTitle}>{ { uz: "Davrlar bo'yicha ko'rsatkichlar", ru: 'Свод показателей по периодам', en: 'Period summary' }[l]}</div>
            <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.th}>{ { uz: 'Davr', ru: 'Период', en: 'Period' }[l]}</th>
              <th className={styles.thR}>{ { uz: 'Daromadlar, USD', ru: 'Доходы, USD', en: 'Revenue, USD' }[l]}</th>
              <th className={styles.thR}>{ { uz: 'Xarajatlar, USD', ru: 'Расходы, USD', en: 'Expenses, USD' }[l]}</th>
              <th className={styles.thR}>{ { uz: 'Moliyaviy natija, USD', ru: 'Финансовый результат, USD', en: 'Financial result, USD' }[l]}</th>
            </tr></thead>
            <tbody>
              <tr><td colSpan={4} className={styles.emptyRow}>
                { { uz: 'Backend API ulanmoqda', ru: 'Подключение API...', en: 'Connecting API...' }[l]}
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.pnlBreakdown}>
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <div className={styles.tableCardTitle} style={{ color: '#059669' }}>
              { { uz: "Daromad moddalari", ru: 'Статьи доходов', en: 'Income items' }[l]}
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>{ { uz: 'Hisob', ru: 'Счёт', en: 'Account' }[l]}</th>
                <th className={styles.th}>{ { uz: 'Nomi', ru: 'Наименование', en: 'Name' }[l]}</th>
                <th className={styles.thR}>{ { uz: 'Summa USD', ru: 'Сумма USD', en: 'Amount USD' }[l]}</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={3} className={styles.emptyRow}>—</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <div className={styles.tableCardTitle} style={{ color: '#DC2626' }}>
              { { uz: "Xarajat moddalari", ru: 'Статьи расходов', en: 'Expense items' }[l]}
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>{ { uz: 'Hisob', ru: 'Счёт', en: 'Account' }[l]}</th>
                <th className={styles.th}>{ { uz: 'Nomi', ru: 'Наименование', en: 'Name' }[l]}</th>
                <th className={styles.thR}>{ { uz: 'Summa USD', ru: 'Сумма USD', en: 'Amount USD' }[l]}</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={3} className={styles.emptyRow}>—</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
