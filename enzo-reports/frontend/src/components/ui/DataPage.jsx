import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import styles from './DataPage.module.css';

const PAGE_SIZE = 20;

export default function DataPage({
  queryKey, fetcher, title, subtitle,
  columns, renderFilters,
  topContent,
  defaultParams = {},
  desc = true,
}) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const [params, setParams] = useState({ dateFrom: firstOfYear, dateTo: today, ...defaultParams });
  const [applied, setApplied] = useState({ dateFrom: firstOfYear, dateTo: today, ...defaultParams, pageSize: 500 });
  const [page, setPage] = useState(0);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, applied],
    queryFn: () => fetcher(applied),
    staleTime: 60000,
  });

  const rows = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return desc ? [...arr].reverse() : arr;
  }, [data, desc]);

  const exportCsv = () => {
    if (!rows.length) return;
    const headers = columns.map(c => c.label).join(',');
    const body = rows.map(r => columns.map(c => `"${r[c.key] ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + headers + '\n' + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${queryKey}-${today}.csv`;
    a.click();
  };

  const handleApply = () => {
    setApplied({ ...params, pageSize: 500 });
    setPage(0);
  };

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? styles.spin : ''} />
            {t('ui.refresh')}
          </button>
          <button className={styles.csvBtn} onClick={exportCsv} disabled={!rows.length}>
            <Download size={14} />
            {t('ui.export_csv')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {(renderFilters !== false) && (
        <div className={styles.filterBar}>
          <Filter size={14} className={styles.filterIcon} />
          <div className={styles.filterRow}>
            <div className={styles.fg}>
              <label>{t('ui.from')}</label>
              <input type="date" value={params.dateFrom} className={styles.input}
                onChange={e => setParams(p => ({ ...p, dateFrom: e.target.value }))} />
            </div>
            <div className={styles.fg}>
              <label>{t('ui.to')}</label>
              <input type="date" value={params.dateTo} className={styles.input}
                onChange={e => setParams(p => ({ ...p, dateTo: e.target.value }))} />
            </div>
            {renderFilters && renderFilters(params, setParams)}
          </div>
          <button className={styles.applyBtn} onClick={handleApply}>
            {t('ui.search')}
          </button>
        </div>
      )}

      {/* Optional top content (charts) */}
      {topContent && <div className={styles.topContent}>{topContent(rows, isFetching)}</div>}

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableInfo}>
          <span>{rows.length} {t('ui.records')}</span>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                <ChevronLeft size={13} />{t('ui.prev')}
              </button>
              <span className={styles.pageInfo}>{t('ui.page')} {page + 1} / {totalPages}</span>
              <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                {t('ui.next')}<ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className={styles.state}><div className={styles.spinner} /><span>{t('ui.loading')}</span></div>
        ) : rows.length === 0 ? (
          <div className={styles.state}><span>{t('ui.no_data')}</span></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numTh}>#</th>
                  {columns.map(c => (
                    <th key={c.key} className={c.right ? styles.thR : styles.th} style={c.width ? { width: c.width } : {}}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.numTd}>{page * PAGE_SIZE + i + 1}</td>
                    {columns.map(c => (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
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
