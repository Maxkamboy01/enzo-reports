import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Calendar, Receipt } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const COLORS = ['#64748B','#DC2626','#D97706','#7C3AED','#0891B2','#059669','#F59E0B','#0D9488'];

const LIST_COLS = [
  { key: 'date',        label: { uz: 'Sana',     ru: 'Дата',          en: 'Date' } },
  { key: 'accountCode', label: { uz: 'Hisob',    ru: 'Счёт',          en: 'Account' } },
  { key: 'accountName', label: { uz: 'Nomi',     ru: 'Наименование',  en: 'Name' } },
  { key: 'document',    label: { uz: 'Hujjat',   ru: 'Документ',      en: 'Document' } },
  { key: 'debitUZS',   label: { uz: 'Debet UZS', ru: 'Дебет UZS',    en: 'Debit UZS' },  right: true },
  { key: 'creditUZS',  label: { uz: 'Kredit UZS', ru: 'Кредит UZS',  en: 'Credit UZS' }, right: true },
  { key: 'comment',    label: { uz: 'Izoh',      ru: 'Комментарий',   en: 'Comment' } },
];

export default function ExpensesPage() {
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo,   setDateTo]   = useState(today);

  const { data: list = [], isLoading: loadList, isFetching: fetchList, refetch: refetchList } = useQuery({
    queryKey: ['greymix-expenses-list', dateFrom, dateTo],
    queryFn: () => dashGreymix.expensesList({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const { data: summary = [], isLoading: loadSum, refetch: refetchSum } = useQuery({
    queryKey: ['greymix-expenses-summary', dateFrom, dateTo],
    queryFn: () => dashGreymix.expensesSummary({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const isFetching = fetchList;
  const refetch = () => { refetchList(); refetchSum(); };

  const totalDebit  = useMemo(() => list.reduce((s, r) => s + (Number(r.debitUZS)  || 0), 0), [list]);
  const totalCredit = useMemo(() => list.reduce((s, r) => s + (Number(r.creditUZS) || 0), 0), [list]);

  const chartData = useMemo(() =>
    summary.filter(r => (Number(r.netUZS) || 0) > 0)
           .sort((a, b) => b.netUZS - a.netUZS)
           .slice(0, 10),
  [summary]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Xarajatlar', ru: 'Расходы', en: 'Expenses' })}</h1>
          <p className={styles.pageSub}>{T({ uz: "94-hisoblar bo'yicha tranzaksiyalar", ru: 'Счета 94 · Транзакции по дате', en: 'Accounts 94 · Transactions by date' })}</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.dateRange}>
            <Calendar size={13} className={styles.calIcon} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
            <span className={styles.dateSep}>—</span>
            <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={styles.dateInput} />
          </div>
          <button className={styles.refreshBtn} onClick={refetch} disabled={isFetching}>
            <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.accountsTotals}>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#DC2626' }}>
          <div className={styles.accountTotalLabel}>{T({ uz: 'JAMI XARAJATLAR UZS', ru: 'ИТОГО РАСХОДЫ UZS', en: 'TOTAL EXPENSES UZS' })}</div>
          <div className={styles.accountTotalValue} style={{ color: '#DC2626' }}>{loadList ? '…' : fmt(totalDebit)}</div>
          <div className={styles.accountTotalIcon} style={{ color: '#DC2626' }}><Receipt size={32} /></div>
        </div>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#64748B' }}>
          <div className={styles.accountTotalLabel}>{T({ uz: 'TRANZAKSIYALAR SONI', ru: 'КОЛИЧЕСТВО ТРАНЗАКЦИЙ', en: 'TRANSACTION COUNT' })}</div>
          <div className={styles.accountTotalValue} style={{ color: '#64748B' }}>{loadList ? '…' : list.length}</div>
          <div className={styles.accountTotalIcon} style={{ color: '#64748B' }}><Receipt size={32} /></div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartAccent} style={{ background: '#DC2626' }} />
            <div>
              <div className={styles.chartTitle}>{T({ uz: "Hisoblar bo'yicha tuzilma", ru: 'Структура по счетам', en: 'Structure by accounts' })}</div>
              <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
            </div>
          </div>
          {loadSum ? (
            <div className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></div>
          ) : chartData.length === 0 ? (
            <div className={styles.chartEmpty}><span>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</span></div>
          ) : (
            <div style={{ padding: '0 16px 16px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} dataKey="netUZS" nameKey="accountName" innerRadius={55} outerRadius={90}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.7rem' }}>{v}</span>} />
                  <Tooltip formatter={v => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <div className={styles.tableCardTitle}>{T({ uz: "Hisoblar bo'yicha jami", ru: 'Итого по счетам', en: 'Total by accounts' })}</div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>{T({ uz: 'Hisob', ru: 'Счёт', en: 'Account' })}</th>
                <th className={styles.th}>{T({ uz: 'Nomi', ru: 'Наименование', en: 'Name' })}</th>
                <th className={styles.thR}>{T({ uz: 'Debet UZS', ru: 'Дебет UZS', en: 'Debit UZS' })}</th>
                <th className={styles.thR}>{T({ uz: 'Net UZS', ru: 'Net UZS', en: 'Net UZS' })}</th>
              </tr></thead>
              <tbody>
                {loadSum ? (
                  <tr><td colSpan={4} className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></td></tr>
                ) : summary.length === 0 ? (
                  <tr><td colSpan={4} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
                ) : summary.map((r, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.td}>{r.accountCode ?? '—'}</td>
                    <td className={styles.td}>{r.accountName ?? '—'}</td>
                    <td className={styles.tdR}>{fmt(r.totalDebitUZS)}</td>
                    <td className={styles.tdR}>{fmt(r.netUZS)}</td>
                  </tr>
                ))}
              </tbody>
              {summary.length > 0 && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={2} className={styles.td}>{T({ uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' })}</td>
                    <td className={styles.tdR}>{fmt(summary.reduce((s, r) => s + (Number(r.totalDebitUZS) || 0), 0))}</td>
                    <td className={styles.tdR}>{fmt(summary.reduce((s, r) => s + (Number(r.netUZS) || 0), 0))}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className={styles.tableCardTitle}>{T({ uz: 'Xarajatlar · 94-hisoblar', ru: 'Расходы · Счета 94', en: 'Expenses · Accounts 94' })}</div>
            <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
          </div>
          {!loadList && <span className={styles.rowCount}>{list.length} {T({ uz: 'ta', ru: 'шт.', en: 'rows' })}</span>}
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {LIST_COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {loadList ? (
                <tr><td colSpan={LIST_COLS.length + 1} className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={LIST_COLS.length + 1} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
              ) : list.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {LIST_COLS.map(c => (
                    <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                      {c.right ? fmt(row[c.key]) : (row[c.key] != null ? String(row[c.key]).slice(0, 10) === row[c.key] && c.key === 'date' ? String(row[c.key]).slice(0, 10) : row[c.key] : '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {list.length > 0 && (
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={5} className={styles.td}>{T({ uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' })}</td>
                  <td className={styles.tdR}>{fmt(totalDebit)}</td>
                  <td className={styles.tdR}>{fmt(totalCredit)}</td>
                  <td className={styles.td} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
