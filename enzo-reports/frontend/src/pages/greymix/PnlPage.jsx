import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RefreshCw, Calendar, TrendingUp, TrendingDown, BarChart2, Percent } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const MONTHS = ['', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export default function PnlPage() {
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo,   setDateTo]   = useState(today);
  const [selMonth, setSelMonth] = useState(null);

  const { data: summary = [], isLoading: loadSum, isFetching, refetch: refetchSum } = useQuery({
    queryKey: ['greymix-pnl-summary', dateFrom, dateTo],
    queryFn: () => dashGreymix.pnlSummary({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const { data: details = [], isLoading: loadDet, refetch: refetchDet } = useQuery({
    queryKey: ['greymix-pnl-details', dateFrom, dateTo],
    queryFn: () => dashGreymix.pnlDetails({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const refetch = () => { refetchSum(); refetchDet(); };

  const totIncome   = useMemo(() => summary.reduce((s, r) => s + (Number(r.income)   || 0), 0), [summary]);
  const totExpenses = useMemo(() => summary.reduce((s, r) => s + (Number(r.expenses) || 0), 0), [summary]);
  const totResult   = totIncome - totExpenses;
  const margin      = totIncome > 0 ? (totResult / totIncome) * 100 : null;

  const chartData = useMemo(() =>
    summary.map(r => ({
      label: `${MONTHS[r.month] ?? r.month}/${r.year}`,
      income:   Number(r.income)   || 0,
      expenses: Number(r.expenses) || 0,
      result:   Number(r.result)   || 0,
    })),
  [summary]);

  const incomeRows  = useMemo(() => details.filter(r => r.type === 4 || r.groupMask === 4), [details]);
  const expenseRows = useMemo(() => details.filter(r => r.type === 5 || r.groupMask === 5), [details]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Foyda va zarar (P&L)', ru: 'Отчёт P&L', en: 'P&L Report' })}</h1>
          <p className={styles.pageSub}>{T({ uz: "Daromadlar, xarajatlar va moliyaviy natija", ru: 'Доходы, расходы и финансовый результат периода', en: 'Revenue, expenses and financial result' })}</p>
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

      <div className={styles.statsGrid}>
        {[
          { label: T({ uz: 'DAROMADLAR UZS', ru: 'ДОХОДЫ UZS', en: 'REVENUE UZS' }), value: fmt(totIncome),   icon: TrendingUp,  color: '#059669' },
          { label: T({ uz: 'XARAJATLAR UZS', ru: 'РАСХОДЫ UZS', en: 'EXPENSES UZS' }), value: fmt(totExpenses), icon: TrendingDown, color: '#DC2626' },
          { label: T({ uz: 'NATIJA UZS', ru: 'РЕЗУЛЬТАТ UZS', en: 'RESULT UZS' }),   value: fmt(totResult),   icon: BarChart2,   color: totResult >= 0 ? '#0891B2' : '#DC2626' },
          { label: T({ uz: 'RENTABELLIK', ru: 'РЕНТАБЕЛЬНОСТЬ', en: 'PROFITABILITY' }), value: fmtPct(margin),  icon: Percent,     color: '#7C3AED' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={styles.statCard}>
              <div className={styles.statLabel} style={{ borderLeftColor: c.color }}>{c.label}</div>
              <div className={styles.statValue} style={{ color: c.color }}>{loadSum ? '...' : c.value}</div>
              <div className={styles.statIcon} style={{ background: c.color + '18', color: c.color }}><Icon size={20} /></div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartAccent} style={{ background: '#0891B2' }} />
          <div>
            <div className={styles.chartTitle}>{T({ uz: 'P&L dinamikasi · UZS', ru: 'Динамика P&L · UZS', en: 'P&L dynamics · UZS' })}</div>
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
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v} />
                <Tooltip formatter={v => fmt(v)} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="income"   name={T({ uz: 'Daromad', ru: 'Доходы', en: 'Revenue' })}  fill="#059669" radius={[3,3,0,0]} />
                <Bar dataKey="expenses" name={T({ uz: 'Xarajat', ru: 'Расходы', en: 'Expenses' })} fill="#DC2626" radius={[3,3,0,0]} />
                <Bar dataKey="result"   name={T({ uz: 'Natija', ru: 'Результат', en: 'Result' })}  fill="#0891B2" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <div className={styles.tableCardTitle}>{T({ uz: "Oylar bo'yicha ko'rsatkichlar", ru: 'Свод по периодам', en: 'Period summary' })}</div>
          <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.th}>{T({ uz: 'Davr', ru: 'Период', en: 'Period' })}</th>
              <th className={styles.thR}>{T({ uz: 'Daromad UZS', ru: 'Доходы UZS', en: 'Revenue UZS' })}</th>
              <th className={styles.thR}>{T({ uz: 'Xarajat UZS', ru: 'Расходы UZS', en: 'Expenses UZS' })}</th>
              <th className={styles.thR}>{T({ uz: 'Natija UZS', ru: 'Результат UZS', en: 'Result UZS' })}</th>
              <th className={styles.thR}>{T({ uz: 'Rentabellik', ru: 'Рентаб.', en: 'Margin' })}</th>
            </tr></thead>
            <tbody>
              {loadSum ? (
                <tr><td colSpan={5} className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></td></tr>
              ) : summary.length === 0 ? (
                <tr><td colSpan={5} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
              ) : summary.map((r, i) => {
                const res = Number(r.result) || (Number(r.income) - Number(r.expenses));
                const mgn = Number(r.income) > 0 ? (res / Number(r.income)) * 100 : null;
                return (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.td}>{MONTHS[r.month] ?? r.month}/{r.year}</td>
                    <td className={styles.tdR} style={{ color: '#059669' }}>{fmt(r.income)}</td>
                    <td className={styles.tdR} style={{ color: '#DC2626' }}>{fmt(r.expenses)}</td>
                    <td className={styles.tdR} style={{ color: res >= 0 ? '#059669' : '#DC2626' }}>{fmt(res)}</td>
                    <td className={styles.tdR}>{fmtPct(mgn)}</td>
                  </tr>
                );
              })}
            </tbody>
            {summary.length > 0 && (
              <tfoot>
                <tr className={styles.totalRow}>
                  <td className={styles.td}>{T({ uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' })}</td>
                  <td className={styles.tdR}>{fmt(totIncome)}</td>
                  <td className={styles.tdR}>{fmt(totExpenses)}</td>
                  <td className={styles.tdR} style={{ color: totResult >= 0 ? '#059669' : '#DC2626' }}>{fmt(totResult)}</td>
                  <td className={styles.tdR}>{fmtPct(margin)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className={styles.pnlBreakdown}>
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <div className={styles.tableCardTitle} style={{ color: '#059669' }}>{T({ uz: "Daromad moddalari", ru: 'Статьи доходов', en: 'Income items' })}</div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>{T({ uz: 'Hisob', ru: 'Счёт', en: 'Account' })}</th>
                <th className={styles.th}>{T({ uz: 'Nomi', ru: 'Наименование', en: 'Name' })}</th>
                <th className={styles.thR}>{T({ uz: 'Summa UZS', ru: 'Сумма UZS', en: 'Amount UZS' })}</th>
              </tr></thead>
              <tbody>
                {loadDet ? (
                  <tr><td colSpan={3} className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></td></tr>
                ) : incomeRows.length === 0 ? (
                  <tr><td colSpan={3} className={styles.emptyRow}>—</td></tr>
                ) : incomeRows.map((r, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.td}>{r.accountCode ?? '—'}</td>
                    <td className={styles.td}>{r.accountName ?? '—'}</td>
                    <td className={styles.tdR} style={{ color: '#059669' }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <div className={styles.tableCardTitle} style={{ color: '#DC2626' }}>{T({ uz: "Xarajat moddalari", ru: 'Статьи расходов', en: 'Expense items' })}</div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>{T({ uz: 'Hisob', ru: 'Счёт', en: 'Account' })}</th>
                <th className={styles.th}>{T({ uz: 'Nomi', ru: 'Наименование', en: 'Name' })}</th>
                <th className={styles.thR}>{T({ uz: 'Summa UZS', ru: 'Сумма UZS', en: 'Amount UZS' })}</th>
              </tr></thead>
              <tbody>
                {loadDet ? (
                  <tr><td colSpan={3} className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></td></tr>
                ) : expenseRows.length === 0 ? (
                  <tr><td colSpan={3} className={styles.emptyRow}>—</td></tr>
                ) : expenseRows.map((r, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.td}>{r.accountCode ?? '—'}</td>
                    <td className={styles.td}>{r.accountName ?? '—'}</td>
                    <td className={styles.tdR} style={{ color: '#DC2626' }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
