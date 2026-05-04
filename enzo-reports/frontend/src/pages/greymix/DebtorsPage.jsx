import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, RefreshCw, UserMinus } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null || n === '' ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const COLORS = ['#DC2626','#1B3A8C','#059669','#D97706','#7C3AED','#0891B2','#F59E0B','#0D9488'];

const COLS = [
  { key: 'cardCode', label: { uz: 'Kod',       ru: 'Код',          en: 'Code' } },
  { key: 'cardName', label: { uz: 'Nomi',      ru: 'Наименование', en: 'Name' } },
  { key: 'group',    label: { uz: 'Guruh',     ru: 'Группа',       en: 'Group' } },
  { key: 'balanceUZS', label: { uz: 'Balans UZS', ru: 'Баланс UZS', en: 'Balance UZS' }, right: true },
];

export default function DebtorsPage() {
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

  const totalUZS = useMemo(() =>
    data.reduce((s, r) => s + (Number(r.balanceUZS) || 0), 0), [data]);

  const groupChart = useMemo(() => {
    const map = {};
    for (const r of data) {
      const g = r.groupName ?? r.group ?? T({ uz: 'Boshqa', ru: 'Прочие', en: 'Other' });
      map[g] = (map[g] || 0) + (Number(r.balanceUZS) || 0);
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(e => e.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Debitorlar', ru: 'Дебиторы', en: 'Debtors' })}</h1>
          <p className={styles.pageSub}>{T({ uz: 'Xaridorlar qarzdorligi', ru: 'Задолженность покупателей', en: 'Customer receivables' })}</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>

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
            <div className={styles.chartSub}>{T({ uz: 'Debitorlik qarzdorligi UZS', ru: 'Дебиторская задолженность UZS', en: 'Debtors total UZS' })}</div>
          </div>
        </div>
        {isLoading ? (
          <div className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></div>
        ) : groupChart.length === 0 ? (
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
            placeholder={T({ uz: "Nomi yoki kodi bo'yicha qidirish...", ru: 'Поиск по наименованию или коду...', en: 'Search by name or code...' })}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.bpTotal}>
          {T({ uz: 'Jami debitorlar:', ru: 'Всего дебиторов:', en: 'Total debtors:' })}
          <span className={styles.bpTotalValue}>{isLoading ? '…' : filtered.length}</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className={styles.tableCardTitle}>{T({ uz: "Debitorlar ro'yxati", ru: 'Список дебиторов', en: 'Debtors list' })}</div>
          {!isLoading && <span className={styles.rowCount}>{data.length} {T({ uz: 'ta', ru: 'шт.', en: 'items' })}</span>}
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.numTh}>#</th>
              {COLS.map(c => <th key={c.key} className={c.right ? styles.thR : styles.th}>{T(c.label)}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={COLS.length + 1} className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={COLS.length + 1} className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.numTd}>{i + 1}</td>
                  {COLS.map(c => (
                    <td key={c.key} className={c.right ? styles.tdR : styles.td}>
                      {c.right ? fmt(row[c.key]) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
