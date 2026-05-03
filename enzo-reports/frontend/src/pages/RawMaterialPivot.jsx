import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dash, fmtFull } from '../services/api';
import { RefreshCw, Download } from 'lucide-react';
import styles from './Pivot.module.css';

export default function RawMaterialPivot({ fetcher = dash.rawMaterialPivot, queryKey = 'raw-material-pivot' }) {
  const today = new Date();
  const [month, setMonth] = useState(today.toISOString().slice(0, 7));
  const [applied, setApplied] = useState(month);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, applied],
    queryFn: () => fetcher({ month: applied }),
    staleTime: 60000,
  });

  // Get max day in month
  const [y, m] = applied.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  const exportCsv = () => {
    if (!data.length) return;
    const h = ['Маҳсулот', ...days.map(d => `${d}-кун`), 'Жами'].join(',');
    const b = data.map(r => [`"${r.itemName}"`, ...days.map(d => r[d] || 0), r.total].join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + h + '\n' + b], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `pivot-${applied}.csv`; a.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Хом ашё сарфи — Пивот жадвал</h1>
          <p className={styles.sub}>Ойлик кунлик тақсимот</p>
        </div>
        <div className={styles.actions}>
          <input
            type="month" value={month} className={styles.monthInput}
            onChange={e => setMonth(e.target.value)}
          />
          <button className={styles.applyBtn} onClick={() => setApplied(month)}>Кўриш</button>
          <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? styles.spin : ''} />
          </button>
          <button className={styles.csvBtn} onClick={exportCsv} disabled={!data.length}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : data.length === 0 ? (
          <div className={styles.empty}>Маълумот топилмади</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.stickyTh}>Маҳсулот</th>
                  {days.map(d => <th key={d} className={styles.dayTh}>{d}</th>)}
                  <th className={styles.totalTh}>Жами</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const maxDay = Math.max(...days.map(d => parseFloat(row[d] || 0)));
                  return (
                    <tr key={i} className={styles.tr}>
                      <td className={styles.itemCell}>{row.itemName}</td>
                      {days.map(d => {
                        const val = parseFloat(row[d] || 0);
                        const intensity = maxDay > 0 ? val / maxDay : 0;
                        return (
                          <td key={d} className={styles.dayCell}
                            style={{ background: val > 0 ? `rgba(27,58,140,${0.08 + intensity * 0.55})` : 'transparent',
                                     color: intensity > 0.5 ? '#fff' : val > 0 ? 'var(--primary)' : 'var(--grey-400)' }}>
                            {val > 0 ? fmtFull(val) : ''}
                          </td>
                        );
                      })}
                      <td className={styles.totalCell}>{fmtFull(row.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className={styles.footRow}>
                  <td className={styles.stickyTh} style={{ fontWeight: 700 }}>Жами</td>
                  {days.map(d => {
                    const sum = data.reduce((s, r) => s + parseFloat(r[d] || 0), 0);
                    return <td key={d} className={styles.dayCell} style={{ fontWeight: 600, background: sum > 0 ? 'rgba(27,58,140,0.06)' : '' }}>{sum > 0 ? fmtFull(sum) : ''}</td>;
                  })}
                  <td className={styles.totalCell} style={{ fontWeight: 700 }}>
                    {fmtFull(data.reduce((s, r) => s + parseFloat(r.total || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
