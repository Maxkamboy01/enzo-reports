import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';
import { fetchReport, exportReport } from '../../services/api';
import styles from '../../components/ui/ReportPage.module.css';

const COLUMNS = [
  { key: 'agent', label: 'Агент' },
  { key: 'db', label: 'База' },
  { key: 'customer', label: 'Харидор' },
  { key: 'docNum', label: 'Инвойс №' },
  { key: 'docDate', label: 'Сана' },
  { key: 'itemName', label: 'Маҳсулот' },
  { key: 'quantity', label: 'Миқдор', right: true },
  { key: 'total', label: 'Жами', right: true },
  { key: 'currency', label: 'Валюта' },
];

const DB_OPTIONS = ['all', 'cement', 'shifer', 'jbi'];
const DB_LABELS = { all: 'Барча базалар', cement: 'Цемент', shifer: 'Шифер', jbi: 'ЖБИ' };

export default function SalesByAgent() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 7) + '-01';
  const [filters, setFilters] = useState({ dateFrom: firstOfMonth, dateTo: today, db: 'all', agent: '' });
  const [applied, setApplied] = useState(filters);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['sales-by-agent', applied],
    queryFn: () => fetchReport('common', 'sales-by-agent', applied),
    staleTime: 60000,
  });

  const rows = data?.rows || data || [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Сотув — Агентлар бўйича</h1>
          <p className={styles.subtitle}>Барча базалардан · {rows.length} қатор</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? styles.spinning : ''} /> Янгилаш
          </button>
          <button className={styles.exportBtn} disabled={exporting}
            onClick={async () => { setExporting(true); try { await exportReport('common', 'sales-by-agent', applied); } finally { setExporting(false); } }}>
            <Download size={15} /> {exporting ? 'Юкланяпти...' : 'Excel юклаш'}
          </button>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>Дан:</label>
            <input type="date" className={styles.input} value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
          </div>
          <div className={styles.filterGroup}>
            <label>Гача:</label>
            <input type="date" className={styles.input} value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
          </div>
          <div className={styles.filterGroup}>
            <label>База:</label>
            <select className={styles.input} value={filters.db} onChange={e => setFilters(f => ({ ...f, db: e.target.value }))}>
              {DB_OPTIONS.map(o => <option key={o} value={o}>{DB_LABELS[o]}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Агент:</label>
            <input className={styles.input} placeholder="Агент номи" value={filters.agent} onChange={e => setFilters(f => ({ ...f, agent: e.target.value }))} />
          </div>
        </div>
        <button className={styles.applyBtn} onClick={() => setApplied(filters)}>Қидириш</button>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loading}><div className={styles.spinner} /><span>Юкланяпти...</span></div>
        ) : rows.length === 0 ? (
          <div className={styles.empty}><span>Маълумот топилмади</span></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numTh}>#</th>
                  {COLUMNS.map(c => <th key={c.key} className={c.right ? styles.thRight : styles.th}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.numTd}>{i + 1}</td>
                    {COLUMNS.map(c => (
                      <td key={c.key} className={c.right ? styles.tdRight : styles.td}>
                        {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
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
