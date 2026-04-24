import { useQuery } from '@tanstack/react-query';
import { dash, fmtFull } from '../services/api';
import { RefreshCw, Database } from 'lucide-react';
import styles from './SiloStock.module.css';

const SILO_COLORS = ['#1B3A8C','#059669','#D97706','#7C3AED','#DC2626','#0891B2','#0D9488'];

export default function SiloStock() {
  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['silo-stock'],
    queryFn: dash.siloStock,
    staleTime: 60000,
  });

  // Group by silo
  const silos = data.reduce((acc, r) => {
    if (!acc[r.silos]) acc[r.silos] = { name: r.name, key: r.silos, items: [] };
    acc[r.silos].items.push(r);
    return acc;
  }, {});

  const totalAll = data.reduce((s, r) => s + parseFloat(r.onHand || 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Силос қолдиқлари</h1>
          <p className={styles.sub}>Умумий: <strong>{fmtFull(totalAll)} кг</strong></p>
        </div>
        <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={14} className={isFetching ? styles.spin : ''} /> Янгилаш
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : (
        <div className={styles.silosGrid}>
          {Object.values(silos).map((silo, si) => {
            const total = silo.items.reduce((s, r) => s + parseFloat(r.onHand || 0), 0);
            const pct = totalAll > 0 ? (total / totalAll) * 100 : 0;
            const col = SILO_COLORS[si % SILO_COLORS.length];
            return (
              <div key={silo.key} className={styles.siloCard}>
                {/* Visual tank */}
                <div className={styles.tank}>
                  <div className={styles.tankIcon} style={{ borderColor: col }}>
                    <Database size={24} color={col} />
                    <div className={styles.tankFill} style={{ height: `${Math.min(pct * 2, 100)}%`, background: col + '30' }} />
                  </div>
                </div>

                <div className={styles.siloInfo}>
                  <div className={styles.siloName} style={{ color: col }}>{silo.name}</div>
                  <div className={styles.siloTotal}>{fmtFull(total)} кг</div>
                  <div className={styles.siloItems}>
                    {silo.items.map((item, i) => (
                      <div key={i} className={styles.siloItem}>
                        <div className={styles.siloItemName}>{item.sement}</div>
                        <div className={styles.siloItemCode}>{item.semenCode}</div>
                        <div className={styles.siloItemQty}>{fmtFull(item.onHand)} кг</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {!isLoading && data.length > 0 && (
        <div className={styles.tableCard}>
          <div className={styles.tableTitle}>Жадвал кўриниши</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th><th>Силос</th><th>Номи</th><th>Маҳсулот коди</th><th>Маҳсулот</th>
                  <th className={styles.r}>Қолдиқ (кг)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td className={styles.num}>{i+1}</td>
                    <td><span className={styles.badge}>{r.silos}</span></td>
                    <td>{r.name}</td>
                    <td><code className={styles.code}>{r.semenCode}</code></td>
                    <td>{r.sement}</td>
                    <td className={styles.r}><strong>{fmtFull(r.onHand)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
