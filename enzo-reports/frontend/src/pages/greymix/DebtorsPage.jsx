import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, RefreshCw, UserMinus, Calendar } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtDate = v => v ? String(v).slice(0, 10) : '—';

const COLORS = ['#DC2626','#1B3A8C','#059669','#D97706','#7C3AED','#0891B2','#F59E0B','#0D9488'];

const TABS = [
  { id: 'list',   label: { uz: "Ro'yxat",  ru: 'Список',   en: 'List' } },
  { id: 'aging',  label: { uz: 'Eskirish', ru: 'Старение', en: 'Aging' } },
  { id: 'recon',  label: { uz: 'Sверка',   ru: 'Сверка',   en: 'Reconciliation' } },
];

const Spinner = () => (
  <div className={styles.emptyRow} style={{ padding: '40px 20px' }}>
    <div className={styles.spinner} style={{ margin: '0 auto' }} />
  </div>
);

const NoData = () => (
  <tr><td colSpan={20} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
);

/* ── List tab ── */
function ListTab() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-debitors-list'],
    queryFn: () => dashGreymix.debitorsList(),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.cardCode ?? r.code ?? '').toLowerCase().includes(q) ||
      String(r.cardName ?? r.name ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalUZS = useMemo(() => data.reduce((s, r) => s + (Number(r.balanceUZS) || 0), 0), [data]);

  const groupChart = useMemo(() => {
    const map = {};
    for (const r of data) {
      const g = r.groupName ?? r.group ?? T({ uz: 'Boshqa', ru: 'Прочие', en: 'Other' });
      map[g] = (map[g] || 0) + (Number(r.balanceUZS) || 0);
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(e => e.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  const COLS = [
    { key: 'cardCode',   label: { uz: 'Kod',       ru: 'Код',          en: 'Code' } },
    { key: 'cardName',   label: { uz: 'Nomi',      ru: 'Наименование', en: 'Name' } },
    { key: 'group',      label: { uz: 'Guruh',     ru: 'Группа',       en: 'Group' }, alt: 'groupName' },
    { key: 'balanceUZS', label: { uz: 'Balans UZS', ru: 'Баланс UZS', en: 'Balance UZS' }, right: true },
  ];

  return (
    <>
      <div className={styles.accountsTotals}>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#DC2626' }}>
          <div className={styles.accountTotalLabel}>{T({ uz: 'JAMI DEBITORLIK UZS', ru: 'ИТОГО ДЕБИТОРОВ UZS', en: 'TOTAL DEBTORS UZS' })}</div>
          <div className={styles.accountTotalValue} style={{ color: '#DC2626' }}>{isLoading ? '…' : fmt(totalUZS)}</div>
          <div className={styles.accountTotalIcon} style={{ color: '#DC2626' }}><UserMinus size={32} /></div>
        </div>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#1B3A8C' }}>
          <div className={styles.accountTotalLabel}>{T({ uz: 'DEBITORLAR SONI', ru: 'КОЛИЧЕСТВО ДЕБИТОРОВ', en: 'DEBTOR COUNT' })}</div>
          <div className={styles.accountTotalValue} style={{ color: '#1B3A8C' }}>{isLoading ? '…' : data.length}</div>
          <div className={styles.accountTotalIcon} style={{ color: '#1B3A8C' }}><UserMinus size={32} /></div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartAccent} style={{ background: '#DC2626' }} />
          <div>
            <div className={styles.chartTitle}>{T({ uz: "Guruhlar bo'yicha tuzilma", ru: 'Структура по группам', en: 'Structure by groups' })}</div>
          </div>
        </div>
        {isLoading ? <Spinner /> : groupChart.length === 0 ? (
          <div className={styles.chartEmpty}><span>{T({ uz: "Ma'lumot yo'q", ru: 'Нет данных', en: 'No data' })}</span></div>
        ) : (
          <div style={{ padding: '0 16px 16px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={groupChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {groupChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.72rem' }}>{v}</span>} />
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={T({ uz: "Nomi yoki kodi...", ru: 'Наименование или код...', en: 'Name or code...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          {T({ uz: 'Jami:', ru: 'Всего:', en: 'Total:' })} <span className={styles.bpTotalValue}>{isLoading ? '…' : filtered.length}</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={5}><Spinner /></td></tr>
              : filtered.length === 0 ? <NoData />
              : filtered.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => {
                    const val = row[c.key] ?? (c.alt ? row[c.alt] : null);
                    return (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                        {c.right ? fmt(val) : (val ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── Aging tab ── */
function AgingTab() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-debitors-aging'],
    queryFn: () => dashGreymix.debitorsAging(),
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      String(r.cardCode ?? r.code ?? '').toLowerCase().includes(q) ||
      String(r.cardName ?? r.name ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const COLS = [
    { key: 'cardCode',  label: { uz: 'Kod',       ru: 'Код',          en: 'Code' } },
    { key: 'cardName',  label: { uz: 'Nomi',      ru: 'Клиент',       en: 'Name' }, alt: 'name' },
    { key: 'current',   label: { uz: 'Joriy',     ru: 'Текущий',      en: 'Current' },     right: true, alt: 'notDue' },
    { key: 'days1_30',  label: { uz: '1–30 kun',  ru: '1–30 дней',    en: '1–30 days' },   right: true, alt: 'overDue30' },
    { key: 'days31_60', label: { uz: '31–60 kun', ru: '31–60 дней',   en: '31–60 days' },  right: true, alt: 'overDue60' },
    { key: 'days61_90', label: { uz: '61–90 kun', ru: '61–90 дней',   en: '61–90 days' },  right: true, alt: 'overDue90' },
    { key: 'daysOver90',label: { uz: '90+ kun',   ru: 'Более 90 дней',en: '90+ days' },    right: true, alt: 'overDue91' },
    { key: 'total',     label: { uz: 'Jami',      ru: 'Итого',        en: 'Total' },        right: true, alt: 'totalBalance' },
  ];

  return (
    <>
      <div className={styles.bpFilterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder={T({ uz: "Nomi yoki kodi...", ru: 'Наименование или код...', en: 'Name or code...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          {T({ uz: 'Jami:', ru: 'Всего:', en: 'Total:' })} <span className={styles.bpTotalValue}>{isLoading ? '…' : filtered.length}</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={9}><Spinner /></td></tr>
              : filtered.length === 0 ? <NoData />
              : filtered.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => {
                    const val = row[c.key] ?? (c.alt ? row[c.alt] : null);
                    return (
                      <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                        {c.right ? fmt(val) : (val ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── Reconciliation tab ── */
function ReconTab({ dateFrom, dateTo }) {
  const [inputVal,    setInputVal]    = useState('');
  const [cardCode,    setCardCode]    = useState('');
  const [cardLabel,   setCardLabel]   = useState('');
  const [showSugg,    setShowSugg]    = useState(false);
  const wrapRef = useRef(null);

  // Load debitors list for the picker
  const { data: list = [] } = useQuery({
    queryKey: ['greymix-debitors-list'],
    queryFn: () => dashGreymix.debitorsList(),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => list.map(r => ({
    code: r.cardCode ?? r.code ?? '',
    name: r.cardName ?? r.name ?? '',
  })).filter(o => o.code), [list]);

  const suggestions = useMemo(() => {
    if (!inputVal.trim()) return options.slice(0, 10);
    const q = inputVal.toLowerCase();
    return options.filter(o => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)).slice(0, 12);
  }, [inputVal, options]);

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (o) => { setCardCode(o.code); setCardLabel(`${o.code} — ${o.name}`); setInputVal(`${o.code} — ${o.name}`); setShowSugg(false); };

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['greymix-debitors-reconciliation', cardCode, dateFrom, dateTo],
    queryFn: () => dashGreymix.debitorsReconciliation({ cardCode, dateFrom, dateTo }),
    enabled: !!cardCode,
    staleTime: 60000,
  });

  const COLS = [
    { key: 'docDate', label: { uz: 'Sana',     ru: 'Дата',        en: 'Date' },       fmt: fmtDate },
    { key: 'docNum',  label: { uz: 'Hujjat №', ru: 'Документ №',  en: 'Document #' }, alt: 'docEntry' },
    { key: 'debit',   label: { uz: 'Debet',    ru: 'Дебет',       en: 'Debit' },      right: true, alt: 'debitUZS' },
    { key: 'credit',  label: { uz: 'Kredit',   ru: 'Кредит',      en: 'Credit' },     right: true, alt: 'creditUZS' },
    { key: 'balance', label: { uz: 'Qoldiq',   ru: 'Остаток',     en: 'Balance' },    right: true, alt: 'balanceUZS' },
  ];

  return (
    <>
      {/* Client picker */}
      <div className={styles.bpFilterBar} style={{ alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }} ref={wrapRef}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input className={styles.searchInput}
              placeholder={T({ uz: 'Debitorni tanlang...', ru: 'Выберите дебитора...', en: 'Select debtor...' })}
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setCardCode(''); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              autoComplete="off"
            />
          </div>
          {showSugg && suggestions.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'1.5px solid #1B3A8C', borderRadius:8, boxShadow:'0 8px 24px rgba(27,58,140,0.12)', zIndex:999, maxHeight:260, overflowY:'auto' }}>
              {suggestions.map(o => (
                <button key={o.code} onMouseDown={e => { e.preventDefault(); select(o); }}
                  style={{ display:'flex', gap:10, width:'100%', padding:'9px 14px', borderBottom:'1px solid #F1F5F9', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background='#EEF2FF'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>
                  <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#1B3A8C', whiteSpace:'nowrap' }}>{o.code}</span>
                  <span style={{ fontSize:'0.78rem', color:'#64748B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {cardCode && (
          <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
          </button>
        )}
      </div>

      {/* Empty state */}
      {!cardCode && (
        <div className={styles.tableCard}>
          <div className={styles.emptyRow} style={{ padding: '40px 20px', color: '#94A3B8' }}>
            {T({ uz: 'Akt-sverka uchun debitorni tanlang', ru: 'Выберите дебитора для просмотра акта сверки', en: 'Select a debtor to view reconciliation' })}
          </div>
        </div>
      )}

      {/* Results */}
      {cardCode && (
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div className={styles.tableCardTitle}>{cardLabel}</div>
              <div className={styles.tableCardSub}>{dateFrom} — {dateTo}</div>
            </div>
            {!isLoading && <span className={styles.rowCount}>{data.length} {T({ uz: 'ta', ru: 'строк', en: 'rows' })}</span>}
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.numTh}>#</th>
                {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
              </tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={6}><Spinner /></td></tr>
                : data.length === 0 ? <NoData />
                : data.map((row, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.numTd}>{i + 1}</td>
                    {COLS.map(c => {
                      const val = row[c.key] ?? (c.alt ? row[c.alt] : null);
                      return (
                        <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                          {c.fmt ? c.fmt(val) : c.right ? fmt(val) : (val ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Main page ── */
export default function DebtorsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfYear = new Date().getFullYear() + '-01-01';
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo,   setDateTo]   = useState(today);
  const [tab,      setTab]      = useState('list');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Debitorlar', ru: 'Дебиторы', en: 'Debtors' })}</h1>
          <p className={styles.pageSub}>{T({ uz: 'Xaridorlar qarzdorligi', ru: 'Задолженность покупателей', en: 'Customer receivables' })}</p>
        </div>
        {tab === 'recon' && (
          <div className={styles.dateRange}>
            <Calendar size={13} className={styles.calIcon} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
            <span className={styles.dateSep}>—</span>
            <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={styles.dateInput} />
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}>{T(t.label)}</button>
        ))}
      </div>

      {tab === 'list'  && <ListTab />}
      {tab === 'aging' && <AgingTab />}
      {tab === 'recon' && <ReconTab dateFrom={dateFrom} dateTo={dateTo} />}
    </div>
  );
}
