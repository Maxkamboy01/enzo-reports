import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RefreshCw, Calendar, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const getName = (r, keys) => { for (const k of keys) if (r[k]) return r[k]; return '—'; };

const IN_COLS = [
  { key: '_name',       label: { uz: 'Xaridor',    ru: 'Покупатель',    en: 'Customer' },     resolver: r => getName(r, ['customerName','cardName','partnerName','name']) },
  { key: 'cashUZS',     label: { uz: 'Naqd UZS',   ru: 'Нал. UZS',      en: 'Cash UZS' },     right: true },
  { key: 'transferUZS', label: { uz: "O'tkaz UZS", ru: 'Перевод UZS',   en: 'Transfer UZS' }, right: true },
  { key: 'totalUZS',    label: { uz: 'Jami UZS',   ru: 'Итого UZS',     en: 'Total UZS' },    right: true },
];

const OUT_COLS = [
  { key: '_name',       label: { uz: 'Yetkazuvchi', ru: 'Поставщик',    en: 'Vendor' },        resolver: r => getName(r, ['vendorName','cardName','partnerName','name']) },
  { key: 'cashUZS',     label: { uz: 'Naqd UZS',    ru: 'Нал. UZS',     en: 'Cash UZS' },     right: true },
  { key: 'transferUZS', label: { uz: "O'tkaz UZS",  ru: 'Перевод UZS',  en: 'Transfer UZS' }, right: true },
  { key: 'totalUZS',    label: { uz: 'Jami UZS',    ru: 'Итого UZS',    en: 'Total UZS' },    right: true },
];

export default function CashFlowPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo,   setDateTo]   = useState(today);

  const { data: incoming = [], isLoading: loadIn, isFetching: fetchIn, refetch: refetchIn } = useQuery({
    queryKey: ['greymix-incoming-payment', dateFrom, dateTo],
    queryFn: () => dashGreymix.incomingPayment({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const { data: outgoing = [], isLoading: loadOut, refetch: refetchOut } = useQuery({
    queryKey: ['greymix-outgoing-payment', dateFrom, dateTo],
    queryFn: () => dashGreymix.outgoingPayment({ dateFrom, dateTo }),
    staleTime: 60000,
  });

  const isFetching = fetchIn;
  const refetch = () => { refetchIn(); refetchOut(); };
  const isLoading = loadIn || loadOut;

  const totalIn  = useMemo(() => incoming.reduce((s, r) => s + (Number(r.totalUZS) || 0), 0), [incoming]);
  const totalOut = useMemo(() => outgoing.reduce((s, r) => s + (Number(r.totalUZS) || 0), 0), [outgoing]);
  const saldo    = totalIn - totalOut;

  const getN = r => r ? (r.customerName ?? r.vendorName ?? r.cardName ?? r.partnerName ?? r.name ?? '—') : '—';

  const chartData = useMemo(() => {
    const top = Math.max(incoming.length, outgoing.length);
    const rows = [];
    for (let i = 0; i < Math.min(top, 10); i++) {
      rows.push({
        name: (getN(incoming[i]) !== '—' ? getN(incoming[i]) : getN(outgoing[i]) !== '—' ? getN(outgoing[i]) : `#${i + 1}`).slice(0, 18),
        in:  Number(incoming[i]?.totalUZS) || 0,
        out: Number(outgoing[i]?.totalUZS) || 0,
      });
    }
    return rows;
  }, [incoming, outgoing]);

  const Loading = () => (
    <div className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Pul oqimlari', ru: 'Денежные потоки', en: 'Cash Flow' })}</h1>
          <p className={styles.pageSub}>{T({ uz: "Kirim va chiqim to'lovlar UZS", ru: 'Входящие / Исходящие платежи UZS', en: 'Incoming & outgoing payments UZS' })}</p>
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
        <div className={styles.statCard}>
          <div className={styles.statLabel} style={{ borderLeftColor: '#059669' }}>{T({ uz: 'KIRIM UZS', ru: 'ВХОДЯЩИЕ UZS', en: 'INCOMING UZS' })}</div>
          <div className={styles.statValue}>{isLoading ? '...' : fmt(totalIn)}</div>
          <div className={styles.statIcon} style={{ background: '#05966918', color: '#059669' }}><TrendingUp size={20} /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel} style={{ borderLeftColor: '#DC2626' }}>{T({ uz: 'CHIQIM UZS', ru: 'ИСХОДЯЩИЕ UZS', en: 'OUTGOING UZS' })}</div>
          <div className={styles.statValue}>{isLoading ? '...' : fmt(totalOut)}</div>
          <div className={styles.statIcon} style={{ background: '#DC262618', color: '#DC2626' }}><TrendingDown size={20} /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel} style={{ borderLeftColor: saldo >= 0 ? '#059669' : '#DC2626' }}>{T({ uz: 'SALDO UZS', ru: 'САЛЬДО UZS', en: 'BALANCE UZS' })}</div>
          <div className={styles.statValue} style={{ color: saldo >= 0 ? '#059669' : '#DC2626' }}>{isLoading ? '...' : fmt(saldo)}</div>
          <div className={styles.statIcon} style={{ background: '#0D948818', color: '#0D9488' }}><ArrowLeftRight size={20} /></div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartAccent} style={{ background: '#059669' }} />
          <div>
            <div className={styles.chartTitle}>{T({ uz: 'Kirim vs Chiqim · UZS', ru: 'Входящие vs Исходящие · UZS', en: 'Incoming vs Outgoing · UZS' })}</div>
            <div className={styles.chartSub}>{dateFrom} — {dateTo}</div>
          </div>
        </div>
        {isLoading ? <Loading /> : chartData.length === 0 ? (
          <div className={styles.chartEmpty}><span>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</span></div>
        ) : (
          <div style={{ padding: '0 16px 16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v} />
                <Tooltip formatter={v => fmt(v)} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="in"  name={T({ uz: 'Kirim', ru: 'Входящие', en: 'Incoming' })} fill="#059669" radius={[3,3,0,0]} />
                <Bar dataKey="out" name={T({ uz: 'Chiqim', ru: 'Исходящие', en: 'Outgoing' })} fill="#DC2626" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className={styles.tableCardTitle} style={{ color: '#059669' }}>{T({ uz: 'Kirim to\'lovlar', ru: 'Входящие платежи', en: 'Incoming payments' })}</div>
            {!loadIn && <span className={styles.rowCount}>{incoming.length}</span>}
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.numTh}>#</th>
                {IN_COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
              </tr></thead>
              <tbody>
                {loadIn ? (
                  <tr><td colSpan={IN_COLS.length + 1}><Loading /></td></tr>
                ) : incoming.length === 0 ? (
                  <tr><td colSpan={IN_COLS.length + 1} className={styles.emptyRow}>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</td></tr>
                ) : incoming.map((row, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.numTd}>{i + 1}</td>
                    {IN_COLS.map(c => (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                        {c.resolver ? c.resolver(row) : c.right ? fmt(row[c.key]) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {incoming.length > 0 && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={2} className={styles.td}>{T({ uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' })}</td>
                    <td className={styles.tdR}>{fmt(incoming.reduce((s,r) => s+(Number(r.cashUZS)||0),0))}</td>
                    <td className={styles.tdR}>{fmt(incoming.reduce((s,r) => s+(Number(r.transferUZS)||0),0))}</td>
                    <td className={styles.tdR}>{fmt(totalIn)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className={styles.tableCardTitle} style={{ color: '#DC2626' }}>{T({ uz: "Chiqim to'lovlar", ru: 'Исходящие платежи', en: 'Outgoing payments' })}</div>
            {!loadOut && <span className={styles.rowCount}>{outgoing.length}</span>}
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.numTh}>#</th>
                {OUT_COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
              </tr></thead>
              <tbody>
                {loadOut ? (
                  <tr><td colSpan={OUT_COLS.length + 1}><Loading /></td></tr>
                ) : outgoing.length === 0 ? (
                  <tr><td colSpan={OUT_COLS.length + 1} className={styles.emptyRow}>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</td></tr>
                ) : outgoing.map((row, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.numTd}>{i + 1}</td>
                    {OUT_COLS.map(c => (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                        {c.resolver ? c.resolver(row) : c.right ? fmt(row[c.key]) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {outgoing.length > 0 && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={2} className={styles.td}>{T({ uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' })}</td>
                    <td className={styles.tdR}>{fmt(outgoing.reduce((s,r) => s+(Number(r.cashUZS)||0),0))}</td>
                    <td className={styles.tdR}>{fmt(outgoing.reduce((s,r) => s+(Number(r.transferUZS)||0),0))}</td>
                    <td className={styles.tdR}>{fmt(totalOut)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
