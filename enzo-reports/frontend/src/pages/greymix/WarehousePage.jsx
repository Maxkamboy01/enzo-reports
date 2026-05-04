import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const COLS = [
  { key: 'itemCode',  label: { uz: 'Tovar kodi',  ru: 'Код товара',   en: 'Item Code' } },
  { key: 'itemName',  label: { uz: 'Nomi',         ru: 'Наименование', en: 'Name' } },
  { key: 'group',     label: { uz: 'Guruh',         ru: 'Группа',       en: 'Group' } },
  { key: 'stock',     label: { uz: 'Qoldiq',        ru: 'Остаток',      en: 'Stock' }, right: true, badge: true },
  { key: 'warehouse', label: { uz: 'Ombor',         ru: 'Склад',        en: 'Warehouse' } },
];

export default function WarehousePage() {
  const [search,    setSearch]    = useState('');
  const [threshold, setThreshold] = useState(10);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-stock-low', threshold],
    queryFn: () => dashGreymix.stockLow({ threshold }),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.itemCode ?? '').toLowerCase().includes(q) ||
      String(r.itemName ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Ombor', ru: 'Склад', en: 'Warehouse' })}</h1>
          <p className={styles.pageSub}>{T({ uz: `${threshold} ta dan kam tovarlar`, ru: `Товары с низким остатком (менее ${threshold} шт.)`, en: `Items with stock below ${threshold}` })}</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>

      <div className={styles.filterBarSimple}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={T({ uz: "Kod yoki nomi bo'yicha qidirish...", ru: 'Поиск по коду или наименованию...', en: 'Search by code or name...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.thresholdWrap}>
          <label className={styles.thresholdLabel}>{T({ uz: 'Chegara:', ru: 'Порог:', en: 'Threshold:' })}</label>
          <input type="number" className={styles.thresholdInput} value={threshold} min={0} max={9999}
            onChange={e => setThreshold(Number(e.target.value))} />
        </div>
        <div className={styles.lowStockBadge}>
          {T({ uz: 'Kam qoldiqlar:', ru: 'Всего с низким остатком:', en: 'Low stock count:' })}
          <span className={styles.lowStockCount}>{isLoading ? '…' : filtered.length}</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={COLS.length + 1} className={styles.emptyRow}>
                  <div className={styles.spinner} style={{ margin: '0 auto' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={COLS.length + 1} className={styles.emptyRow}>
                  {T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}
                </td></tr>
              ) : filtered.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => (
                    <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                      {c.badge ? (
                        <span className={styles.stockBadge}
                          style={{ background: Number(row[c.key]) === 0 ? '#FEE2E2' : '#FEF3C7', color: Number(row[c.key]) === 0 ? '#DC2626' : '#92400E' }}>
                          {row[c.key] ?? 0}
                        </span>
                      ) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
