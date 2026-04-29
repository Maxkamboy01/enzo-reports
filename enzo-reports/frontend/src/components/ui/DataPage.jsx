import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import styles from './DataPage.module.css';

const PAGE_SIZE = 50;

export default function DataPage({
  queryKey, fetcher, title, subtitle,
  columns, renderFilters,
  topContent,
  defaultParams = {},
  desc = true,
}) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 7) + '-01';
  const [params, setParams] = useState({ dateFrom: firstOfMonth, dateTo: today, ...defaultParams });
  const [applied, setApplied] = useState(params);
  const [page, setPage] = useState(0);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, applied],
    queryFn: () => fetcher(applied),
    staleTime: 60000,
  });

  // Reset page to 0 when data changes
  const rows = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return desc ? [...arr].reverse() : arr;
  }, [data, desc]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

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
    setPage(0);
    setApplied({ ...params });
  };

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
          {rows.length > PAGE_SIZE && (
            <span className={styles.pageInfo}>
              {t('ui.page') || 'Бет'} {safePage + 1} / {totalPages}
              {' · '}
              {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, rows.length)}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className={styles.state}><div className={styles.spinner} /><span>{t('ui.loading')}</span></div>
        ) : rows.length === 0 ? (
          <div className={styles.state}><span>{t('ui.no_data')}</span></div>
        ) : (
          <>
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
                      <td className={styles.numTd}>{safePage * PAGE_SIZE + i + 1}</td>
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

            {/* Pagination controls */}
            {rows.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                >
                  <ChevronLeft size={15} />
                  {t('ui.prev') || 'Олдинги'}
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 2)
                    .reduce((acc, i, idx, arr) => {
                      if (idx > 0 && i - arr[idx - 1] > 1) acc.push('…');
                      acc.push(i);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '…' ? (
                        <span key={`dots-${idx}`} className={styles.pageDots}>…</span>
                      ) : (
                        <button
                          key={item}
                          className={`${styles.pageNum} ${item === safePage ? styles.pageNumActive : ''}`}
                          onClick={() => setPage(item)}
                        >
                          {item + 1}
                        </button>
                      )
                    )
                  }
                </div>

                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage === totalPages - 1}
                >
                  {t('ui.next') || 'Кейингиси'}
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
