import { useState } from 'react';
import { Package, Search, RefreshCw } from 'lucide-react';
import styles from './ModulePage.module.css';

const COLS = [
  { key: 'itemCode', label: { uz: 'Tovar kodi', ru: 'Код товара', en: 'Item Code' } },
  { key: 'itemName', label: { uz: 'Nomi', ru: 'Наименование', en: 'Name' } },
  { key: 'group', label: { uz: 'Guruh', ru: 'Группа', en: 'Group' } },
  { key: 'stock', label: { uz: 'Qoldiq', ru: 'Остаток', en: 'Stock' }, right: true },
  { key: 'warehouse', label: { uz: 'Ombor', ru: 'Склад', en: 'Warehouse' } },
];

export default function WarehousePage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';
  const [search, setSearch] = useState('');
  const [threshold, setThreshold] = useState(10);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{ { uz: 'Ombor', ru: 'Склад', en: 'Warehouse' }[l]}</h1>
          <p className={styles.pageSub}>{ { uz: `${threshold} ta dan kam tovarlar`, ru: `Товары с низким остатком (менее ${threshold} шт.)`, en: `Items with stock below ${threshold}` }[l]}</p>
        </div>
        <button className={styles.refreshBtn}><RefreshCw size={13} /></button>
      </div>

      <div className={styles.filterBarSimple}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder={ { uz: "Kod yoki nomi bo'yicha qidirish...", ru: 'Поиск по коду или наименованию...', en: 'Search by code or name...' }[l]}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.thresholdWrap}>
          <label className={styles.thresholdLabel}>{ { uz: 'Chegara:', ru: 'Порог:', en: 'Threshold:' }[l]}</label>
          <input type="number" className={styles.thresholdInput} value={threshold} min={0} max={1000}
            onChange={e => setThreshold(Number(e.target.value))} />
        </div>
        <div className={styles.lowStockBadge}>
          { { uz: 'Kam qoldiqlar:', ru: 'Всего с низким остатком:', en: 'Low stock count:' }[l]}
          <span className={styles.lowStockCount}>—</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label[l]}</th>)}
            </tr></thead>
            <tbody>
              <tr><td colSpan={COLS.length + 1} className={styles.emptyRow}>
                { { uz: 'Backend API ulanmoqda', ru: 'Подключение API...', en: 'Connecting API...' }[l]}
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
