import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Landmark } from 'lucide-react';
import { dashGreymix } from '../../services/apiGreymix';
import styles from './ModulePage.module.css';

const L = localStorage.getItem('enzo_lang') || 'uz';
const lang = ['uz','ru','en'].includes(L) ? L : 'uz';
const T = o => o[lang] ?? o.uz ?? '';

const fmt = n => n == null ? '—' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function groupAccounts(accounts) {
  const groups = {};
  for (const acc of accounts) {
    const code = String(acc.accountCode ?? acc.acctCode ?? '');
    const prefix = code.slice(0, 2);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(acc);
  }
  return groups;
}

const GROUP_META = {
  '50': { label: { uz: 'Kassa USD',    ru: 'Касса USD',    en: 'Cash USD' },    color: '#059669' },
  '51': { label: { uz: 'Kassa UZS',    ru: 'Касса UZS',    en: 'Cash UZS' },    color: '#0891B2' },
  '52': { label: { uz: 'Kartalar',     ru: 'Карты',         en: 'Cards' },       color: '#7C3AED' },
  '53': { label: { uz: "O'tkazmalar",  ru: 'Перечисления',  en: 'Transfers' },   color: '#F59E0B' },
};

export default function AccountsPage({ fetchers = dashGreymix, queryPrefix = 'greymix' }) {
  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: [`${queryPrefix}-account-balance`],
    queryFn: () => fetchers.accountBalance(),
    staleTime: 60000,
  });

  const grouped = useMemo(() => groupAccounts(data), [data]);
  const totalAll = useMemo(() => data.reduce((s, a) => s + Number(a.balance ?? 0), 0), [data]);
  const groupTotal = (accs) => accs.reduce((s, a) => s + Number(a.balance ?? 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{T({ uz: 'Hisob-raqamlar', ru: 'Счета', en: 'Accounts' })}</h1>
          <p className={styles.pageSub}>{T({ uz: '50-hisoblar · Kassa va bank', ru: '50-е счета · Кассы и расчётные счета', en: '50xx accounts · Cash & bank' })}</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={13} className={isFetching ? styles.spin : ''} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#0891B2' }}>
          <div className={styles.accountTotalLabel}>{T({ uz: 'JAMI BALANS', ru: 'ОБЩИЙ БАЛАНС', en: 'TOTAL BALANCE' })}</div>
          <div className={styles.accountTotalValue} style={{ color: '#0891B2' }}>
            {isLoading ? '…' : fmt(totalAll)}
          </div>
          <div className={styles.accountTotalIcon} style={{ color: '#0891B2' }}><Landmark size={32} /></div>
        </div>
      </div>

      {!isLoading && data.length > 0 && Object.keys(grouped).length === 0 && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>{T({ uz: 'Hisob kodi', ru: 'Код счёта', en: 'Account Code' })}</th>
                <th className={styles.th}>{T({ uz: 'Nomi', ru: 'Наименование', en: 'Name' })}</th>
                <th className={styles.thR}>{T({ uz: 'Balans', ru: 'Баланс', en: 'Balance' })}</th>
              </tr></thead>
              <tbody>
                {data.map((a, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.td}>{a.accountCode ?? a.acctCode ?? '—'}</td>
                    <td className={styles.td}>{a.accountName ?? a.acctName ?? '—'}</td>
                    <td className={styles.tdR}>{fmt(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([prefix, accs]) => {
        const meta = GROUP_META[prefix] ?? { label: { uz: prefix, ru: prefix, en: prefix }, color: '#64748B' };
        const total = groupTotal(accs);
        return (
          <div key={prefix} className={styles.accountGroup}>
            <div className={styles.accountGroupHeader}>
              <div className={styles.accountGroupTitle} style={{ color: meta.color }}>
                <span className={styles.accountGroupDot} style={{ background: meta.color }} />
                {T(meta.label)}
                <span className={styles.accountGroupCount}>
                  {accs.length} {T({ uz: 'ta hisob', ru: 'счетов', en: 'accounts' })}
                </span>
              </div>
              <div className={styles.accountGroupTotal} style={{ color: meta.color }}>{fmt(total)}</div>
            </div>
            <div className={styles.accountSubGrid} style={{ gridTemplateColumns: `repeat(${Math.min(accs.length, 5)}, 1fr)` }}>
              {accs.map((a, i) => {
                const pct = total !== 0 ? Math.abs((Number(a.balance) / total) * 100) : 0;
                return (
                  <div key={i} className={styles.accountSubCard}>
                    <div className={styles.subCardName}>{a.accountName ?? a.acctName ?? '—'}</div>
                    <div className={styles.subCardBalance} style={{ color: meta.color }}>{fmt(a.balance)}</div>
                    <div className={styles.subCardBar}>
                      <div className={styles.subCardBarFill} style={{ width: `${pct}%`, background: meta.color }} />
                    </div>
                    <div className={styles.subCardCode}>{a.accountCode ?? a.acctCode} · {pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className={styles.tableCard}>
          <div className={styles.emptyRow}><div className={styles.spinner} style={{ margin: '0 auto' }} /></div>
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <div className={styles.tableCard}>
          <div className={styles.emptyRow}>{T({ uz: "Ma'lumot topilmadi", ru: 'Данные не найдены', en: 'No data found' })}</div>
        </div>
      )}
    </div>
  );
}
