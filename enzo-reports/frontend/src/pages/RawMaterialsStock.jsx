import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dash, fmt, fmtFull } from '../services/api';
import { RefreshCw, Download, Package, Search, X } from 'lucide-react';
import styles from './StockPage.module.css';

export default function RawMaterialsStock({ fetcher = dash.rawMaterialsStock }) {
  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['raw-materials-stock'],
    queryFn: fetcher,
    staleTime: 60000,
  });

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(r =>
      (r.itemName || '').toLowerCase().includes(q) ||
      (r.itemCode || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalAll = data.reduce((s, r) => s + parseFloat(r.total || 0), 0);
  const filteredTotal = filtered.reduce((s, r) => s + parseFloat(r.total || 0), 0);

  const exportCsv = () => {
    const h = 'Код,Номи,Асосий склад,Силослар,Тегирмон,Жами';
    const b = filtered.map(r => `"${r.itemCode}","${r.itemName}","${r.whsCode}","${r.siloslar}","${r.tegirmon}","${r.total}"`).join('\n');
    const blob = new Blob(['\uFEFF' + h + '\n' + b], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `raw-materials-stock-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Хом ашё қолдиқлари</h1>
          <p className={styles.sub}>
            Умумий: <strong>{fmtFull(totalAll)} кг</strong> · {data.length} та маҳсулот
            {search && filtered.length !== data.length && (
              <> · <span style={{ color: 'var(--primary)' }}>{filtered.length} та топилди</span></>
            )}
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? styles.spin : ''} /> Янгилаш
          </button>
          <button className={styles.csvBtn} onClick={exportCsv} disabled={!filtered.length}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Маҳсулот номи ёки коди бўйича қидириш..."
        />
        {search && (
          <button className={styles.searchClear} onClick={() => setSearch('')}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className={styles.sumGrid}>
        {filtered.map((row, i) => {
          const total = parseFloat(row.total || 0);
          const pct = totalAll > 0 ? (total / totalAll) * 100 : 0;
          const colors = ['#1B3A8C','#059669','#D97706','#7C3AED','#DC2626','#0891B2','#0D9488','#9333EA'];
          const col = colors[i % colors.length];
          return (
            <div key={i} className={styles.sumCard}>
              <div className={styles.sumIcon} style={{ background: col + '18', color: col }}>
                <Package size={18} />
              </div>
              <div className={styles.sumBody}>
                <div className={styles.sumName} title={row.itemName}>{row.itemName}</div>
                <div className={styles.sumCode}>{row.itemCode}</div>
                <div className={styles.sumVal}>{fmtFull(row.total)} <span>кг</span></div>
                <div className={styles.sumBar}>
                  <div className={styles.sumBarFill} style={{ width: `${pct}%`, background: col }} />
                </div>
                <div className={styles.sumPct}>{pct.toFixed(1)}%</div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !isLoading && (
          <div className={styles.noResults}>Маҳсулот топилмади</div>
        )}
      </div>

      {/* Full table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Код</th>
                  <th>Номи</th>
                  <th className={styles.r}>Асосий склад (кг)</th>
                  <th className={styles.r}>Силослар (кг)</th>
                  <th className={styles.r}>Тегирмон (кг)</th>
                  <th className={styles.r}>Жами (кг)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    <td className={styles.num}>{i + 1}</td>
                    <td><code className={styles.code}>{row.itemCode}</code></td>
                    <td className={styles.name}>{row.itemName}</td>
                    <td className={styles.r}>{fmtFull(row.whsCode)}</td>
                    <td className={styles.r}>{fmtFull(row.siloslar)}</td>
                    <td className={styles.r}>{fmtFull(row.tegirmon)}</td>
                    <td className={styles.r}><strong>{fmtFull(row.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={6} className={styles.totalLabel}>Жами умумий</td>
                  <td className={styles.r}><strong>{fmtFull(search ? filteredTotal : totalAll)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
