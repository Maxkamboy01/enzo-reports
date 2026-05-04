import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Search, RefreshCw, Calendar, Package, DollarSign, Hash } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';
import pcStyles from './ProductCostPage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const COLORS = [
  '#1B3A8C','#059669','#D97706','#DC2626','#7C3AED',
  '#0891B2','#F59E0B','#0D9488','#64748B','#EC4899',
];

export default function ProductCostPage() {
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const today = new Date().toISOString().slice(0, 10);

  const [itemCode, setItemCode]   = useState('');
  const [inputVal, setInputVal]   = useState('');
  const [dateFrom, setDateFrom]   = useState(firstOfYear);
  const [dateTo,   setDateTo]     = useState(today);
  const [searched, setSearched]   = useState(false);

  const enabled = !!itemCode;

  const { data: structure = [], isLoading: loadStr, isFetching: fetchStr, refetch: refetchStr } = useQuery({
    queryKey: ['product-cost-structure', itemCode, dateFrom, dateTo],
    queryFn: () => dashGreymix.productCostStructure({ itemCode, dateFrom, dateTo }),
    enabled,
    staleTime: 60000,
  });

  const { data: summary = {}, isLoading: loadSum, refetch: refetchSum } = useQuery({
    queryKey: ['product-cost-summary', itemCode, dateFrom, dateTo],
    queryFn: () => dashGreymix.productCostSummary({ itemCode, dateFrom, dateTo }),
    enabled,
    staleTime: 60000,
  });

  const isLoading = loadStr || loadSum;
  const isFetching = fetchStr;

  const handleSearch = () => {
    const v = inputVal.trim();
    if (!v) return;
    setItemCode(v);
    setSearched(true);
  };

  const refetch = () => { refetchStr(); refetchSum(); };

  const totalCost     = summary.TotalCost  ?? summary.totalCost  ?? 0;
  const totalQty      = summary.TotalQty   ?? summary.totalQty   ?? 0;
  const avgCostPerUnit = summary.AvgCostPerUnit ?? summary.avgCostPerUnit ?? (totalQty > 0 ? totalCost / totalQty : 0);
  const parentItem    = summary.ParentItem ?? summary.parentItem ?? itemCode;

  const chartData = useMemo(() =>
    structure.map(r => ({
      name:  r.ItemName ?? r.itemName ?? r.Component ?? r.component ?? '—',
      value: Number(r.TotalCost ?? r.totalCost ?? r.Cost ?? 0),
      pct:   Number(r.PercentOfTotal ?? r.percentOfTotal ?? r.Percent ?? 0),
      qty:   Number(r.TotalQty ?? r.totalQty ?? r.Qty ?? 0),
      code:  r.Component ?? r.component ?? '—',
    })).sort((a, b) => b.value - a.value),
  [structure]);

  const maxCost = chartData.length > 0 ? chartData[0].value : 1;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Mahsulot tannarxi', ru: 'Себестоимость продукта', en: 'Product Cost Structure' })}</h1>
          <p className={styles.pageSub}>{T({ uz: "Komponentlar bo'yicha xarajat tuzilmasi", ru: 'Структура себестоимости по компонентам', en: 'Cost breakdown by component' })}</p>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className={pcStyles.searchBar}>
        <div className={pcStyles.itemSearchWrap}>
          <Package size={15} className={pcStyles.searchIcon} />
          <input
            className={pcStyles.itemInput}
            placeholder={T({ uz: 'Mahsulot kodi (masalan: SHF-001)...', ru: 'Код товара (напр. SHF-001)...', en: 'Item code (e.g. SHF-001)...' })}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className={styles.dateRange} style={{ flex: 'none' }}>
          <Calendar size={13} className={styles.calIcon} />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
          <span className={styles.dateSep}>—</span>
          <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={styles.dateInput} />
        </div>
        <button className={pcStyles.searchBtn} onClick={handleSearch}>
          <Search size={14} />
          {T({ uz: 'Qidirish', ru: 'Найти', en: 'Search' })}
        </button>
        {enabled && (
          <button className={styles.refreshBtn} onClick={refetch} disabled={isFetching}>
            <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
          </button>
        )}
      </div>

      {/* ── Empty state before search ── */}
      {!searched && (
        <div className={pcStyles.emptyState}>
          <Package size={48} className={pcStyles.emptyIcon} />
          <div className={pcStyles.emptyTitle}>{T({ uz: 'Mahsulot kodini kiriting', ru: 'Введите код товара', en: 'Enter an item code' })}</div>
          <div className={pcStyles.emptyDesc}>{T({ uz: 'Yuqorida mahsulot kodini yozing va qidirish tugmasini bosing', ru: 'Введите код товара и нажмите «Найти»', en: 'Type an item code above and press Search' })}</div>
        </div>
      )}

      {/* ── Loading ── */}
      {searched && isLoading && (
        <div className={styles.tableCard}>
          <div className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></div>
        </div>
      )}

      {/* ── No data ── */}
      {searched && !isLoading && structure.length === 0 && (
        <div className={styles.tableCard}>
          <div className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })} — {itemCode}</div>
        </div>
      )}

      {/* ── Results ── */}
      {searched && !isLoading && structure.length > 0 && (<>

        {/* Item title banner */}
        <div className={pcStyles.itemBanner}>
          <div className={pcStyles.itemBannerCode}>{parentItem}</div>
          <div className={pcStyles.itemBannerSub}>{dateFrom} — {dateTo}</div>
        </div>

        {/* KPI cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel} style={{ borderLeftColor: '#1B3A8C' }}>{T({ uz: 'JAMI XARAJAT UZS', ru: 'ИТОГО СЕБЕСТОИМОСТЬ UZS', en: 'TOTAL COST UZS' })}</div>
            <div className={styles.statValue}>{fmt(totalCost)}</div>
            <div className={styles.statIcon} style={{ background: '#1B3A8C18', color: '#1B3A8C' }}><DollarSign size={20} /></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel} style={{ borderLeftColor: '#059669' }}>{T({ uz: 'ISHLAB CHIQARILGAN', ru: 'ПРОИЗВЕДЕНО (ед.)', en: 'PRODUCED (units)' })}</div>
            <div className={styles.statValue}>{fmt(totalQty)}</div>
            <div className={styles.statIcon} style={{ background: '#05966918', color: '#059669' }}><Hash size={20} /></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel} style={{ borderLeftColor: '#D97706' }}>{T({ uz: 'BIRLIK NARXI UZS', ru: 'СЕБЕСТ. НА ЕД. UZS', en: 'COST PER UNIT UZS' })}</div>
            <div className={styles.statValue} style={{ color: '#D97706' }}>{fmt(avgCostPerUnit)}</div>
            <div className={styles.statIcon} style={{ background: '#D9770618', color: '#D97706' }}><Package size={20} /></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel} style={{ borderLeftColor: '#7C3AED' }}>{T({ uz: 'KOMPONENTLAR SONI', ru: 'КОМПОНЕНТОВ', en: 'COMPONENTS' })}</div>
            <div className={styles.statValue}>{structure.length}</div>
            <div className={styles.statIcon} style={{ background: '#7C3AED18', color: '#7C3AED' }}><BarChart2Icon size={20} /></div>
          </div>
        </div>

        {/* Chart + breakdown table */}
        <div className={pcStyles.analysisRow}>
          {/* Donut chart */}
          <div className={`${styles.chartCard} ${pcStyles.chartPanel}`}>
            <div className={styles.chartHeader}>
              <span className={styles.chartAccent} style={{ background: '#1B3A8C' }} />
              <div>
                <div className={styles.chartTitle}>{T({ uz: 'Xarajat tuzilmasi (%)', ru: 'Структура себестоимости (%)', en: 'Cost structure (%)' })}</div>
                <div className={styles.chartSub}>{parentItem} · {dateFrom} — {dateTo}</div>
              </div>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v, name, props) => [
                      `${fmt(v)} UZS (${fmtPct(props.payload.pct)})`,
                      props.payload.name,
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => <span style={{ fontSize: '0.72rem' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Horizontal bar breakdown */}
          <div className={`${styles.chartCard} ${pcStyles.breakdownPanel}`}>
            <div className={styles.chartHeader}>
              <span className={styles.chartAccent} style={{ background: '#D97706' }} />
              <div>
                <div className={styles.chartTitle}>{T({ uz: "Komponentlar ulushi", ru: 'Доля компонентов', en: 'Component share' })}</div>
                <div className={styles.chartSub}>{T({ uz: 'Umumiy xarajatdagi ulush', ru: 'Доля в общей себестоимости', en: 'Share of total cost' })}</div>
              </div>
            </div>
            <div className={pcStyles.breakdownList}>
              {chartData.map((item, i) => (
                <div key={i} className={pcStyles.breakdownRow}>
                  <div className={pcStyles.breakdownTop}>
                    <div className={pcStyles.breakdownName}>
                      <span className={pcStyles.breakdownDot} style={{ background: COLORS[i % COLORS.length] }} />
                      <span className={pcStyles.breakdownCode}>{item.code}</span>
                      <span className={pcStyles.breakdownItem}>{item.name}</span>
                    </div>
                    <div className={pcStyles.breakdownPct} style={{ color: COLORS[i % COLORS.length] }}>
                      {fmtPct(item.pct)}
                    </div>
                  </div>
                  <div className={pcStyles.barTrack}>
                    <div
                      className={pcStyles.barFill}
                      style={{ width: `${item.pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <div className={pcStyles.breakdownCost}>{fmt(item.value)} UZS</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail table */}
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className={styles.tableCardTitle}>{T({ uz: "Batafsil ma'lumot", ru: 'Детализация по компонентам', en: 'Component detail' })}</div>
              <div className={styles.tableCardSub}>{parentItem} · {dateFrom} — {dateTo}</div>
            </div>
            <span className={styles.rowCount}>{structure.length} {T({ uz: 'ta', ru: 'компонентов', en: 'items' })}</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numTh}>#</th>
                  <th className={styles.th}>{T({ uz: 'Kod', ru: 'Код', en: 'Code' })}</th>
                  <th className={styles.th}>{T({ uz: 'Nomi', ru: 'Наименование', en: 'Name' })}</th>
                  <th className={styles.thR}>{T({ uz: 'Miqdor', ru: 'Кол-во', en: 'Qty' })}</th>
                  <th className={styles.thR}>{T({ uz: 'Narx UZS', ru: 'Стоимость UZS', en: 'Cost UZS' })}</th>
                  <th className={styles.th} style={{ minWidth: 180 }}>{T({ uz: 'Ulush', ru: 'Доля', en: 'Share' })}</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.numTd}>{i + 1}</td>
                    <td className={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        {item.code}
                      </span>
                    </td>
                    <td className={styles.td}>{item.name}</td>
                    <td className={styles.tdR}>{fmt(item.qty)}</td>
                    <td className={styles.tdR} style={{ fontWeight: 600 }}>{fmt(item.value)}</td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(item.pct, 100)}%`, background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS[i % COLORS.length], minWidth: 40, textAlign: 'right' }}>
                          {fmtPct(item.pct)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={4} className={styles.td}>{T({ uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' })}</td>
                  <td className={styles.tdR}>{fmt(totalCost)}</td>
                  <td className={styles.td} style={{ fontSize: '0.78rem', color: '#64748B' }}>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </>)}
    </div>
  );
}

// inline icon to avoid unused import warning
function BarChart2Icon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
