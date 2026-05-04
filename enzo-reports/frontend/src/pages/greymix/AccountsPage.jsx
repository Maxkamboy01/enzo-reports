import { RefreshCw, DollarSign, Landmark } from 'lucide-react';
import styles from './ModulePage.module.css';

export default function AccountsPage() {
  const lang = localStorage.getItem('enzo_lang') || 'uz';
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';

  const groups = [
    { id: 'cash_usd', label: { uz: 'Kassa USD', ru: 'Касса USD', en: 'Cash USD' }, color: '#059669', count: 5 },
    { id: 'cash_uzs', label: { uz: 'Kassa UZS', ru: 'Касса UZS', en: 'Cash UZS' }, color: '#0891B2', count: 5 },
    { id: 'cards', label: { uz: 'Kartalar', ru: 'Карты', en: 'Cards' }, color: '#7C3AED', count: 5 },
    { id: 'transfers', label: { uz: "O'tkazmalar", ru: 'Перечисления', en: 'Transfers' }, color: '#F59E0B', count: 1 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{ { uz: 'Hisob-raqamlar', ru: 'Счета', en: 'Accounts' }[l]}</h1>
          <p className={styles.pageSub}>{ { uz: '50-hisoblar · Kassa va bank', ru: '50-е счета · Кассы и расчётные счета', en: '50xx accounts · Cash & bank' }[l]}</p>
        </div>
        <button className={styles.refreshBtn}><RefreshCw size={13} /></button>
      </div>

      <div className={styles.accountsTotals}>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#059669' }}>
          <div className={styles.accountTotalLabel}>{ { uz: 'JAMI USD', ru: 'ИТОГО USD', en: 'TOTAL USD' }[l]}</div>
          <div className={styles.accountTotalValue} style={{ color: '#059669' }}>—</div>
          <div className={styles.accountTotalIcon} style={{ color: '#059669' }}><DollarSign size={28} /></div>
        </div>
        <div className={styles.accountTotalCard} style={{ borderLeftColor: '#0891B2' }}>
          <div className={styles.accountTotalLabel}>{ { uz: 'JAMI UZS', ru: 'ИТОГО UZS', en: 'TOTAL UZS' }[l]}</div>
          <div className={styles.accountTotalValue} style={{ color: '#0891B2' }}>—</div>
          <div className={styles.accountTotalIcon} style={{ color: '#0891B2' }}><Landmark size={28} /></div>
        </div>
      </div>

      {groups.map(g => (
        <div key={g.id} className={styles.accountGroup}>
          <div className={styles.accountGroupHeader}>
            <div className={styles.accountGroupTitle} style={{ color: g.color }}>
              <span className={styles.accountGroupDot} style={{ background: g.color }} />
              {g.label[l]}
              <span className={styles.accountGroupCount}>{ { uz: `${g.count} ta`, ru: `${g.count} счетов`, en: `${g.count} accounts` }[l]}</span>
            </div>
            <div className={styles.accountGroupTotal} style={{ color: g.color }}>—</div>
          </div>
          <div className={styles.accountSubGrid}>
            {Array.from({ length: g.count }).map((_, i) => (
              <div key={i} className={styles.accountSubCard}>
                <div className={styles.subCardName}>{g.label[l]} {i + 1}</div>
                <div className={styles.subCardBalance}>—</div>
                <div className={styles.subCardBar}>
                  <div className={styles.subCardBarFill} style={{ width: '0%', background: g.color }} />
                </div>
                <div className={styles.subCardCode}>50{g.id === 'cash_usd' ? '1' : g.id === 'cash_uzs' ? '1' : g.id === 'cards' ? '2' : '3'}{i} · 0.0%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
