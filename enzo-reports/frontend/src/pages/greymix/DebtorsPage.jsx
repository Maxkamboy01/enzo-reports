import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import styles from './ModulePage.module.css';

const COLS = [
  { key: 'code', label: { uz: 'Kod', ru: 'Код', en: 'Code' } },
  { key: 'name', label: { uz: 'Nomi', ru: 'Наименование', en: 'Name' } },
  { key: 'group', label: { uz: 'Guruh', ru: 'Группа', en: 'Group' } },
  { key: 'balanceUZS', label: { uz: 'Balans UZS', ru: 'Баланс UZS', en: 'Balance UZS' }, right: true },
  { key: 'balanceUSD', label: { uz: 'Balans USD', ru: 'Баланс USD', en: 'Balance USD' }, right: true },
];

export default function DebtorsPage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';
  const [search, setSearch] = useState('');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{ { uz: 'Debitorlar', ru: 'Дебиторы', en: 'Debtors' }[l]}</h1>
          <p className={styles.pageSub}>{ { uz: "Xaridorlar qarzdorligi", ru: 'Задолженность покупателей', en: 'Customer receivables' }[l]}</p>
        </div>
        <button className={styles.refreshBtn}><RefreshCw size={13} /></button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.chartHeader} style={{ padding: '16px 20px 8px' }}>
          <span className={styles.chartAccent} style={{ background: '#DC2626' }} />
          <div>
            <div className={styles.chartTitle}>{ { uz: "Guruhlar bo'yicha tuzilma", ru: 'Структура по группам', en: 'Structure by groups' }[l]}</div>
            <div className={styles.chartSub}>{ { uz: 'Debitorlik qarzdorligi USD', ru: 'Дебиторская задолженность USD', en: 'Debtors total USD' }[l]}</div>
          </div>
        </div>
        <div className={styles.chartEmpty} style={{ height: 220 }}>
          <span>{ { uz: 'Backend API ulanmoqda...', ru: 'Подключение API...', en: 'Connecting API...' }[l]}</span>
        </div>
      </div>

      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={ { uz: "Nomi yoki kodi bo'yicha qidirish...", ru: 'Поиск по наименованию или коду', en: 'Search by name or code...' }[l]}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          { { uz: 'Jami debitorlik qarzdorligi USD', ru: 'Итого дебиторская задолженность USD', en: 'Total debtors USD' }[l]}
          <span className={styles.bpTotalValue}>—</span>
        </div>
      </div>

      <div className={styles.tableCard}>
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
          </table>
        </div>
      </div>
    </div>
  );
}
