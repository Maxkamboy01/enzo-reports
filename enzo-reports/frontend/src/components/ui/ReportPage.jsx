import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw, Filter } from 'lucide-react';
import { fetchReport, exportReport } from '../../services/api';
import styles from './ReportPage.module.css';

export default function ReportPage({ db, reportKey, title, columns, renderFilters, transformData }) {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 7) + '-01';

  const [filters, setFilters] = useState({ dateFrom: firstOfMonth, dateTo: today });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [db, reportKey, appliedFilters],
    queryFn: () => fetchReport(db, reportKey, appliedFilters),
    staleTime: 60000,
  });

  const rows = transformData ? transformData(data) : (data?.rows || data || []);

  const handleExport = async () => {
    setExporting(true);
    try { await exportReport(db, reportKey, appliedFilters); }
    finally { setExporting(false); }
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{db?.toUpperCase()} базасидан · {rows.length || 0} қатор</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? styles.spinning : ''} />
            Янгилаш
          </button>
          <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
            <Download size={15} />
            {exporting ? 'Юкланяпти...' : 'Excel юклаш'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterCard}>
        <div className={styles.filterIcon}><Filter size={14} /></div>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>Дан:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              className={styles.input}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Гача:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              className={styles.input}
            />
          </div>
          {renderFilters && renderFilters(filters, setFilters)}
        </div>
        <button className={styles.applyBtn} onClick={() => setAppliedFilters(filters)}>
          Қидириш
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Маълумотлар юкланяпти...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className={styles.empty}>
            <span>Маълумот топилмади</span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numTh}>#</th>
                  {columns.map(col => (
                    <th key={col.key} className={col.right ? styles.thRight : styles.th}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id || i} className={styles.tr}>
                    <td className={styles.numTd}>{i + 1}</td>
                    {columns.map(col => (
                      <td key={col.key} className={col.right ? styles.tdRight : styles.td}>
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
