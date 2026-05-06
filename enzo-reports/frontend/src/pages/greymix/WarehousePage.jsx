import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, Calendar } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Number(n).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

const TABS = [
  { id: 'low',       label: { uz: 'Kam qoldiqlar',   ru: 'Низкие остатки',   en: 'Low Stock' } },
  { id: 'warehouses', label: { uz: 'Omborlar bo\'yicha', ru: 'По складам',   en: 'By Warehouses' } },
  { id: 'movement',  label: { uz: 'Harakatlar',       ru: 'Движение',         en: 'Movement' } },
];

const Spinner = () => (
  <div className={styles.emptyRow} style={{ padding: '40px 20px' }}>
    <div className={styles.spinner} style={{ margin: '0 auto' }} />
  </div>
);

const NoData = () => (
  <tr><td colSpan={20} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
);

/* ── Low Stock tab ── */
function LowStockTab() {
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

  const COLS = [
    { key: 'itemCode',  label: { uz: 'Tovar kodi',  ru: 'Код товара',   en: 'Item Code' } },
    { key: 'itemName',  label: { uz: 'Nomi',         ru: 'Наименование', en: 'Name' } },
    { key: 'group',     label: { uz: 'Guruh',        ru: 'Группа',       en: 'Group' } },
    { key: 'stock',     label: { uz: 'Qoldiq',       ru: 'Остаток',      en: 'Stock' }, right: true, badge: true },
    { key: 'warehouse', label: { uz: 'Ombor',        ru: 'Склад',        en: 'Warehouse' } },
  ];

  return (
    <>
      <div className={styles.filterBarSimple}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={T({ uz: "Kod yoki nomi bo'yicha...", ru: 'Поиск по коду или наименованию...', en: 'Search by code or name...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.thresholdWrap}>
          <label className={styles.thresholdLabel}>{T({ uz: 'Chegara:', ru: 'Порог:', en: 'Threshold:' })}</label>
          <input type="number" className={styles.thresholdInput} value={threshold} min={0} max={9999}
            onChange={e => setThreshold(Number(e.target.value))} />
        </div>
        <div className={styles.lowStockBadge}>
          {T({ uz: 'Kam qoldiqlar:', ru: 'С низким остатком:', en: 'Low stock count:' })}
          <span className={styles.lowStockCount}>{isLoading ? '…' : filtered.length}</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6}><Spinner /></td></tr>
              : filtered.length === 0 ? <NoData />
              : filtered.map((row, i) => (
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
    </>
  );
}

/* ── Warehouses tab ── */
function WarehousesTab() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-stock-warehouses'],
    queryFn: () => dashGreymix.stockWarehouses(),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.itemCode ?? '').toLowerCase().includes(q) ||
      String(r.itemName ?? r.dscription ?? '').toLowerCase().includes(q) ||
      String(r.whsCode ?? '').toLowerCase().includes(q) ||
      String(r.whsName ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const COLS = [
    { key: 'itemCode',  label: { uz: 'Tovar kodi',  ru: 'Код товара',   en: 'Item Code' } },
    { key: 'itemName',  label: { uz: 'Nomi',         ru: 'Наименование', en: 'Name' },        alt: 'dscription' },
    { key: 'whsCode',   label: { uz: 'Ombor kodi',   ru: 'Код склада',   en: 'Whs Code' } },
    { key: 'whsName',   label: { uz: 'Ombor',        ru: 'Склад',        en: 'Warehouse' } },
    { key: 'onHand',    label: { uz: 'Qoldiq',       ru: 'В наличии',    en: 'On Hand' },     right: true },
    { key: 'committed', label: { uz: 'Band',         ru: 'Зарезервировано', en: 'Committed' }, right: true },
    { key: 'onOrder',   label: { uz: 'Buyurtmada',   ru: 'На заказе',    en: 'On Order' },    right: true },
  ];

  return (
    <>
      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={T({ uz: "Tovar yoki ombor...", ru: 'Товар или склад...', en: 'Item or warehouse...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          {T({ uz: 'Jami:', ru: 'Итого:', en: 'Total:' })} <span className={styles.bpTotalValue}>{isLoading ? '…' : filtered.length}</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={8}><Spinner /></td></tr>
              : filtered.length === 0 ? <NoData />
              : filtered.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => {
                    const val = row[c.key] ?? (c.alt ? row[c.alt] : null);
                    return (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                        {c.right ? fmt(val) : (val ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── Movement tab ── */
function MovementTab({ dateFrom, dateTo }) {
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-stock-movement', dateFrom, dateTo],
    queryFn: () => dashGreymix.stockMovement({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.itemCode ?? '').toLowerCase().includes(q) ||
      String(r.itemName ?? r.dscription ?? '').toLowerCase().includes(q) ||
      String(r.whsCode ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const COLS = [
    { key: 'docDate',   label: { uz: 'Sana',        ru: 'Дата',         en: 'Date' },          fmt: v => v ? String(v).slice(0,10) : '—' },
    { key: 'docNum',    label: { uz: 'Hujjat',      ru: 'Документ',     en: 'Document' } },
    { key: 'itemCode',  label: { uz: 'Tovar kodi',  ru: 'Код товара',   en: 'Item Code' } },
    { key: 'itemName',  label: { uz: 'Nomi',        ru: 'Наименование', en: 'Name' },           alt: 'dscription' },
    { key: 'whsCode',   label: { uz: 'Ombor',       ru: 'Склад',        en: 'Warehouse' } },
    { key: 'quantity',  label: { uz: 'Miqdor',      ru: 'Количество',   en: 'Quantity' },       right: true, alt: 'qty' },
    { key: 'direction', label: { uz: 'Turi',        ru: 'Тип',          en: 'Type' },           alt: 'transType' },
  ];

  return (
    <>
      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={T({ uz: "Tovar yoki ombor...", ru: 'Товар или склад...', en: 'Item or warehouse...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          {T({ uz: 'Jami:', ru: 'Итого:', en: 'Total:' })} <span className={styles.bpTotalValue}>{isLoading ? '…' : filtered.length}</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={8}><Spinner /></td></tr>
              : filtered.length === 0 ? <NoData />
              : filtered.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => {
                    const val = row[c.key] ?? (c.alt ? row[c.alt] : null);
                    return (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                        {c.fmt ? c.fmt(val) : c.right ? fmt(val) : (val ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── Main page ── */
export default function WarehousePage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo,   setDateTo]   = useState(today);
  const [tab,      setTab]      = useState('low');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Ombor', ru: 'Склад', en: 'Warehouse' })}</h1>
          <p className={styles.pageSub}>{T({ uz: 'Ombor holati va harakatlari', ru: 'Состояние и движение склада', en: 'Warehouse status and movements' })}</p>
        </div>
        {(tab === 'movement') && (
          <div className={styles.dateRange}>
            <Calendar size={13} className={styles.calIcon} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
            <span className={styles.dateSep}>—</span>
            <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={styles.dateInput} />
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}>{T(t.label)}</button>
        ))}
      </div>

      {tab === 'low'        && <LowStockTab />}
      {tab === 'warehouses' && <WarehousesTab />}
      {tab === 'movement'   && <MovementTab dateFrom={dateFrom} dateTo={dateTo} />}
    </div>
  );
}
