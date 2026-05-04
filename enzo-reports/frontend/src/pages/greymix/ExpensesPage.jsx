import { useState } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import styles from './ModulePage.module.css';

const COLS = [
  { key: 'date', label: { uz: 'Sana', ru: 'Дата', en: 'Date' } },
  { key: 'manager', label: { uz: 'Menejer', ru: 'Менеджер', en: 'Manager' } },
  { key: 'accountCode', label: { uz: 'Hisob', ru: 'Счёт', en: 'Account' } },
  { key: 'accountName', label: { uz: 'Nomi', ru: 'Наименование', en: 'Name' } },
  { key: 'debitUZS', label: { uz: 'Debet (UZS)', ru: 'Дебет (UZS)', en: 'Debit (UZS)' }, right: true },
  { key: 'creditUZS', label: { uz: 'Kredit (UZS)', ru: 'Кредит (UZS)', en: 'Credit (UZS)' }, right: true },
  { key: 'debitUSD', label: { uz: 'Debet (USD)', ru: 'Дебет (USD)', en: 'Debit (USD)' }, right: true },
  { key: 'creditUSD', label: { uz: 'Kredit (USD)', ru: 'Кредит (USD)', en: 'Credit (USD)' }, right: true },
  { key: 'comment', label: { uz: 'Izoh', ru: 'Комментарий', en: 'Comment' } },
];

export default function ExpensesPage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{ { uz: 'Xarajatlar', ru: 'Расходы', en: 'Expenses' }[l]}</h1>
          <p className={styles.pageSub}>{ { uz: "94-hisoblar bo'yicha tranzaksiyalar", ru: 'Счета 94 · Транзакции по дате', en: 'Accounts 94 · Transactions by date' }[l]}</p>
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

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <div>
            <div className={styles.tableCardTitle}>{ { uz: 'Xarajatlar · 94-hisoblar', ru: 'Расходы · Счета 94', en: 'Expenses · Accounts 94' }[l]}</div>
            <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label[l]}</th>)}
            </tr></thead>
            <tbody>
              <tr><td colSpan={COLS.length} className={styles.emptyRow}>
                { { uz: 'Backend API ulanmoqda', ru: 'Подключение API...', en: 'Connecting API...' }[l]}
              </td></tr>
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan={4} className={styles.td}>{ { uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' }[l]}</td>
                {['debitUZS','creditUZS','debitUSD','creditUSD'].map(k => (
                  <td key={k} className={styles.tdR}>—</td>
                ))}
                <td className={styles.td} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
