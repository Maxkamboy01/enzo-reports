import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, RefreshCw, Calendar, Users, FileText, Package } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';

const PERIODS = [
  { id: 'day',   label: { uz: 'Kun',   ru: 'День',   en: 'Day' } },
  { id: 'week',  label: { uz: 'Hafta', ru: 'Неделя', en: 'Week' } },
  { id: 'month', label: { uz: 'Oy',    ru: 'Месяц',  en: 'Month' } },
];

const TABS = [
  { id: 'overview',  label: { uz: 'Umumiy',      ru: 'Обзор',         en: 'Overview' } },
  { id: 'items',     label: { uz: 'Tovarlar',    ru: 'По товарам',    en: 'By Items' } },
  { id: 'customers', label: { uz: 'Mijozlar',    ru: 'По клиентам',   en: 'By Customers' } },
];

const COLORS = ['#1B3A8C','#059669','#D97706','#DC2626','#7C3AED','#0891B2','#F59E0B','#0D9488'];

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtDate = d => d ? String(d).slice(0, 10) : '';
const T = o => o[lang] ?? o.uz ?? '';

const Spinner = () => (
  <div className={styles.emptyRow} style={{ padding: '40px 20px' }}>
    <div className={styles.spinner} style={{ margin: '0 auto' }} />
  </div>
);

const NoData = () => (
  <tr><td colSpan={20} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
);

/* ── Overview tab ── */
function OverviewTab({ dateFrom, dateTo, period }) {
  const { data: raw, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-sales-overview', dateFrom, dateTo, period],
    queryFn: () => dashGreymix.salesOverview({ dateFrom, dateTo, period }),
    staleTime: 60000,
  });

  const rawRows = useMemo(() => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    const d = raw.data ?? raw;
    if (Array.isArray(d)) return d;
    return Array.isArray(d.managers) ? d.managers : Array.isArray(d.managerData) ? d.managerData : [];
  }, [raw]);

  const managers = useMemo(() => {
    const map = {};
    for (const r of rawRows) {
      const name = r.manager ?? r.managerName ?? r.slpName ?? '—';
      if (!map[name]) map[name] = { manager: name, totalUZS: 0, invoiceCount: 0 };
      map[name].totalUZS    += Number(r.totalUZS) || 0;
      map[name].invoiceCount += Number(r.invoiceCount ?? r.count) || 0;
    }
    return Object.values(map).sort((a, b) => b.totalUZS - a.totalUZS);
  }, [rawRows]);

  const chartData = useMemo(() => {
    if (!Array.isArray(raw) && raw) {
      const d = raw.data ?? raw;
      if (Array.isArray(d.chartData)) return d.chartData;
      if (Array.isArray(d.chart))     return d.chart;
      if (Array.isArray(d.dailyData)) return d.dailyData;
    }
    const map = {};
    for (const r of rawRows) {
      const dt = r.date ?? r.docDate ?? r.DocDate;
      if (!dt) continue;
      const key = String(dt).slice(0, 10);
      map[key] = (map[key] || 0) + (Number(r.totalUZS) || 0);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, totalUZS]) => ({ date, totalUZS }));
  }, [raw, rawRows]);

  const totals = useMemo(() => {
    if (!raw || Array.isArray(raw)) return {};
    const d = raw.data ?? raw;
    return d.totals ?? d.summary ?? d.kpi ?? {};
  }, [raw]);

  const totalUZS     = totals.salesUZS ?? totals.totalUZS ?? totals.totalSalesUZS ?? (managers.reduce((s, m) => s + (Number(m.totalUZS) || 0), 0) || null);
  const invoiceCount = totals.invoiceCount ?? totals.invoices ?? (managers.reduce((s, m) => s + (Number(m.invoiceCount) || 0), 0) || null);
  const managerCount = totals.managerCount ?? totals.managers ?? (managers.length || null);

  const STAT_CARDS = [
    { key: 'totalUZS',  value: fmt(totalUZS),     label: T({ uz: 'JAMI SOTUVLAR UZS', ru: 'ИТОГО ПРОДАЖИ UZS', en: 'TOTAL SALES UZS' }),   icon: TrendingUp, color: '#059669' },
    { key: 'invoices',  value: fmt(invoiceCount), label: T({ uz: 'HUJJATLAR',          ru: 'НАКЛАДНЫХ',          en: 'DOCUMENTS' }),          icon: FileText,   color: '#7C3AED' },
    { key: 'managers',  value: fmt(managerCount), label: T({ uz: 'MENEJERLAR',         ru: 'МЕНЕДЖЕРОВ',         en: 'MANAGERS' }),           icon: Users,      color: '#F59E0B' },
  ];

  const COLS = [
    { key: 'manager',      label: T({ uz: 'Menejer',   ru: 'Менеджер',  en: 'Manager' }),   right: false },
    { key: 'totalUZS',     label: T({ uz: 'Summa UZS', ru: 'Сумма UZS', en: 'Amount UZS' }), right: true },
    { key: 'invoiceCount', label: T({ uz: 'Hujjatlar', ru: 'Накладных', en: 'Documents' }),  right: true },
  ];

  return (
    <>
      <div className={styles.statsGrid}>
        {STAT_CARDS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} className={styles.statCard}>
              <div className={styles.statLabel} style={{ borderLeftColor: c.color }}>{c.label}</div>
              <div className={styles.statValue}>{isLoading ? '...' : c.value}</div>
              <div className={styles.statIcon} style={{ background: c.color + '18', color: c.color }}><Icon size={20} /></div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#059669' }} />
            <div>
              <div className={styles.chartTitle}>{T({ uz: 'Sotuvlar UZS', ru: 'Продажи UZS', en: 'Sales UZS' })}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          {isLoading ? <Spinner /> : chartData.length === 0 ? (
            <div className={styles.chartEmpty}><span>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</span></div>
          ) : (
            <div style={{ padding: '0 16px 16px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={fmtDate} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v} />
                  <Tooltip formatter={v => fmt(v)} labelFormatter={fmtDate} />
                  <Line type="monotone" dataKey="totalUZS" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#1B3A8C' }} />
            <div>
              <div className={styles.chartTitle}>{T({ uz: "Menejerlar ulushi · UZS", ru: 'Доля менеджеров · UZS', en: 'Manager share · UZS' })}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          {isLoading ? <Spinner /> : managers.length === 0 ? (
            <div className={styles.chartEmpty}><span>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</span></div>
          ) : (
            <div style={{ padding: '0 16px 16px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={managers} dataKey="totalUZS" nameKey="manager" innerRadius={50} outerRadius={80}>
                    {managers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.72rem' }}>{v}</span>} />
                  <Tooltip formatter={v => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className={styles.tableCardTitle}>{T({ uz: "Menejerlar bo'yicha hisobot", ru: 'Отчёт по менеджерам', en: 'Manager report' })}</div>
            <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
          </div>
          {managers.length > 0 && <span className={styles.rowCount}>{managers.length} {T({ uz: 'menejer', ru: 'менеджеров', en: 'managers' })}</span>}
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={4}><Spinner /></td></tr>
              : managers.length === 0 ? <NoData />
              : managers.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => (
                    <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                      {c.right ? fmt(row[c.key]) : (row[c.key] ?? '—')}
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

/* ── By Items tab ── */
function ItemsTab({ dateFrom, dateTo }) {
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-sales-by-items', dateFrom, dateTo],
    queryFn: () => dashGreymix.salesByItems({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.itemCode ?? '').toLowerCase().includes(q) ||
      String(r.itemName ?? r.dscription ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const COLS = [
    { key: 'itemCode',     label: T({ uz: 'Kod',        ru: 'Код',           en: 'Code' }),         right: false },
    { key: 'itemName',     label: T({ uz: 'Nomi',       ru: 'Наименование',  en: 'Name' }),         right: false, alt: 'dscription' },
    { key: 'quantity',     label: T({ uz: 'Miqdor',     ru: 'Количество',    en: 'Quantity' }),     right: true,  alt: 'qty' },
    { key: 'totalUZS',     label: T({ uz: 'Summa UZS',  ru: 'Сумма UZS',     en: 'Amount UZS' }),  right: true },
    { key: 'invoiceCount', label: T({ uz: 'Hujjatlar',  ru: 'Накладных',     en: 'Documents' }),   right: true,  alt: 'count' },
  ];

  return (
    <>
      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <input className={styles.searchInput} placeholder={T({ uz: "Tovar kodi yoki nomi...", ru: 'Код или наименование товара...', en: 'Item code or name...' })}
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
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6}><Spinner /></td></tr>
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

/* ── By Customers tab ── */
function CustomersTab({ dateFrom, dateTo }) {
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-sales-by-customer', dateFrom, dateTo],
    queryFn: () => dashGreymix.salesByCustomer({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.cardCode ?? r.code ?? '').toLowerCase().includes(q) ||
      String(r.cardName ?? r.name ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalUZS = useMemo(() => data.reduce((s, r) => s + (Number(r.totalUZS) || 0), 0), [data]);

  const COLS = [
    { key: 'cardCode',     label: T({ uz: 'Kod',        ru: 'Код',          en: 'Code' }),         right: false, alt: 'code' },
    { key: 'cardName',     label: T({ uz: 'Mijoz',      ru: 'Клиент',       en: 'Customer' }),     right: false, alt: 'name' },
    { key: 'groupName',    label: T({ uz: 'Guruh',      ru: 'Группа',       en: 'Group' }),        right: false, alt: 'group' },
    { key: 'totalUZS',     label: T({ uz: 'Summa UZS',  ru: 'Сумма UZS',    en: 'Amount UZS' }),  right: true },
    { key: 'invoiceCount', label: T({ uz: 'Hujjatlar',  ru: 'Накладных',    en: 'Documents' }),   right: true, alt: 'count' },
  ];

  return (
    <>
      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <input className={styles.searchInput} placeholder={T({ uz: "Mijoz kodi yoki nomi...", ru: 'Код или наименование клиента...', en: 'Customer code or name...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          {T({ uz: 'Jami UZS:', ru: 'Итого UZS:', en: 'Total UZS:' })} <span className={styles.bpTotalValue}>{fmt(totalUZS)}</span>
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
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{c.label}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6}><Spinner /></td></tr>
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

/* ── Main page ── */
export default function SalesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo,   setDateTo]   = useState(today);
  const [period,   setPeriod]   = useState('day');
  const [tab,      setTab]      = useState('overview');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Sotuvlar', ru: 'Продажи', en: 'Sales' })}</h1>
          <p className={styles.pageSub}>{T({ uz: 'Savdo hisobotlari', ru: 'Отчёты по продажам', en: 'Sales reports' })}</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.dateRange}>
            <Calendar size={13} className={styles.calIcon} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
            <span className={styles.dateSep}>—</span>
            <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={styles.dateInput} />
          </div>
          {tab === 'overview' && (
            <div className={styles.periodTabs}>
              {PERIODS.map(p => (
                <button key={p.id}
                  className={`${styles.periodBtn} ${period === p.id ? styles.periodActive : ''}`}
                  onClick={() => setPeriod(p.id)}>{p.label[lang]}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}>{T(t.label)}</button>
        ))}
      </div>

      {tab === 'overview'  && <OverviewTab  dateFrom={dateFrom} dateTo={dateTo} period={period} />}
      {tab === 'items'     && <ItemsTab     dateFrom={dateFrom} dateTo={dateTo} />}
      {tab === 'customers' && <CustomersTab dateFrom={dateFrom} dateTo={dateTo} />}
    </div>
  );
}
