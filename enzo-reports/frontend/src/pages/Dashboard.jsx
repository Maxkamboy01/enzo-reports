import { useQuery } from '@tanstack/react-query';
import { dash, fmt, fmtFull, fmtN } from '../services/api';
import { Package, ArrowRight, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

// field accessor — handles both camelCase and underscore_Case
const f = (row, ...keys) => {
  for (const k of keys) {
    if (row[k] != null) return row[k];
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (row[camel] != null) return row[camel];
    const lower = k[0].toLowerCase() + k.slice(1);
    if (row[lower] != null) return row[lower];
  }
  return null;
};
const n = (row, ...keys) => parseFloat(f(row, ...keys)) || 0;

const STATUS_STYLE = {
  'On Track': { color: '#059669', bg: '#F0FDF4', icon: <CheckCircle size={12} /> },
  'Warning':  { color: '#D97706', bg: '#FFFBEB', icon: <AlertTriangle size={12} /> },
  'Off Track':{ color: '#DC2626', bg: '#FEF2F2', icon: <AlertTriangle size={12} /> },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE['On Track'];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:s.bg, color:s.color,
      padding:'3px 9px', borderRadius:20, fontSize:'.7rem', fontWeight:700 }}>
      {s.icon}{status || 'On Track'}
    </span>
  );
}

function ProgressBar({ pct, color = '#1B3A8C' }) {
  const v = Math.min(Math.max(parseFloat(pct) || 0, 0), 100);
  return (
    <div style={{ height:6, background:'#E2E8F0', borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${v}%`, background: v >= 95 ? '#059669' : v >= 80 ? '#D97706' : '#DC2626',
        borderRadius:3, transition:'width 0.6s ease' }} />
    </div>
  );
}

function BigKpi({ label, value, sub, color = '#1B3A8C', bg = '#EFF6FF', icon, to }) {
  const inner = (
    <div className={styles.bigKpi} style={{ '--kpi-color': color, '--kpi-bg': bg }}>
      {icon && <div className={styles.bigKpiIcon}>{icon}</div>}
      <div className={styles.bigKpiVal}>{value}</div>
      <div className={styles.bigKpiLabel}>{label}</div>
      {sub && <div className={styles.bigKpiSub}>{sub}</div>}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration:'none' }}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Хайрли тонг' : hour < 18 ? 'Хайрли кун' : 'Хайрли кеч';

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';
  const params = { dateFrom: monthStart, dateTo: today };

  const invQ   = useQuery({ queryKey: ['inv-transfer', params], queryFn: () => dash.inventoryTransfer(params), staleTime: 120000 });
  const stockQ  = useQuery({ queryKey: ['raw-materials-stock'], queryFn: dash.rawMaterialsStock, staleTime: 120000 });
  const siloQ   = useQuery({ queryKey: ['silo-stock'], queryFn: dash.siloStock, staleTime: 120000 });
  const rcptQ   = useQuery({ queryKey: ['receipt', params], queryFn: () => dash.rawMaterialReceipt(params), staleTime: 120000 });
  const consQ   = useQuery({ queryKey: ['consumption', params], queryFn: () => dash.rawMaterialConsumption(params), staleTime: 120000 });

  const inv = invQ.data || [];

  // Aggregate totals from inventory-transfer
  const totProduced  = inv.reduce((s, r) => s + n(r, 'TotalProduced', 'totalProduced'), 0);
  const totPlanned   = inv.reduce((s, r) => s + n(r, 'TotalPlanned', 'totalPlanned'), 0);
  const totOrders    = inv.reduce((s, r) => s + n(r, 'TotalOrders', 'totalOrders'), 0);
  const totRejected  = inv.reduce((s, r) => s + n(r, 'TotalRejected', 'totalRejected'), 0);
  const totBags      = inv.reduce((s, r) => s + n(r, 'RawMat_Bags50kg', 'rawMat_Bags50kg', 'rawMatBags50kg'), 0);
  const totBagsCeil  = inv.reduce((s, r) => s + n(r, 'RawMat_BagsCeiled', 'rawMat_BagsCeiled', 'rawMatBagsCeiled'), 0);
  const totRmPlan    = inv.reduce((s, r) => s + n(r, 'RawMat_PlannedKg', 'rawMat_PlannedKg', 'rawMatPlannedKg'), 0);
  const totRmActual  = inv.reduce((s, r) => s + n(r, 'RawMat_ActualKg', 'rawMat_ActualKg', 'rawMatActualKg'), 0);
  const avgCompletion = totPlanned > 0 ? (totProduced / totPlanned) * 100 : 0;
  const rejectPct     = totProduced > 0 ? (totRejected / totProduced) * 100 : 0;
  const rmEfficiency  = totRmPlan > 0 ? (totRmActual / totRmPlan) * 100 : 0;

  // Stock totals
  const totalStock = (stockQ.data || []).reduce((s, r) => s + n(r, 'total', 'Total', 'onHand'), 0);
  const totalSilos = (siloQ.data || []).reduce((s, r) => s + n(r, 'onHand', 'OnHand'), 0);

  // Receipt vs Consumption chart (last 14 days)
  const rcptMap = {};
  (rcptQ.data || []).forEach(r => { const d = f(r, 'docDate'); if (d) rcptMap[d] = r; });
  const consMap = {};
  (consQ.data || []).forEach(r => { const d = f(r, 'docDate'); if (d) consMap[d] = r; });
  const chartDates = [...new Set([...Object.keys(rcptMap), ...Object.keys(consMap)])].sort().slice(-14);
  const rcChartData = chartDates.map(d => ({
    date: d.slice(5),
    'Кириш': n(rcptMap[d] || {}, 'klinker', 'Klinker') + n(rcptMap[d] || {}, 'oxaqtosh', 'Oxaqtosh') + n(rcptMap[d] || {}, 'gips', 'Gips'),
    'Сарф':  n(consMap[d] || {}, 'klinker', 'Klinker') + n(consMap[d] || {}, 'oxaqtosh', 'Oxaqtosh') + n(consMap[d] || {}, 'gips', 'Gips'),
  }));

  // Production bar chart data (per product)
  const prodChartData = inv.map(r => ({
    name: (f(r, 'itemName', 'ItemName') || '—').replace('Шифер-', 'Шифр-').slice(0, 16),
    Режа:   n(r, 'TotalPlanned', 'totalPlanned'),
    Факт:   n(r, 'TotalProduced', 'totalProduced'),
    Рад:    n(r, 'TotalRejected', 'totalRejected'),
  }));

  return (
    <div className={styles.page}>

      {/* ── Welcome banner ── */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p className={styles.date}>
            {new Date().toLocaleDateString('ru-RU', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div className={styles.welcomeRight}>
          <div className={styles.welcomeBadge}>
            <Activity size={14} />
            Жонли маълумот
          </div>
          <div className={styles.logoMark}>E</div>
        </div>
      </div>

      {/* ── Section label ── */}
      <div className={styles.sectionLabel}>
        <Zap size={14} />
        ИШЛАБ ЧИҚАРИШ — ОЙ ЯКУНИ
        {invQ.isFetching && <RefreshCw size={13} className={styles.spinning} />}
      </div>

      {/* ── BIG production KPIs ── */}
      <div className={styles.bigKpiRow}>
        <BigKpi
          label="Умумий ишлаб чиқарилди"
          value={fmt(totProduced)}
          sub={totProduced >= 1000 ? fmtFull(totProduced) + ' кг' : 'кг'}
          color="#1B3A8C" bg="#EFF6FF"
          icon={<Activity size={20} />}
          to="/inventory-transfer"
        />
        <BigKpi
          label="Режа бўйича"
          value={fmt(totPlanned)}
          sub={fmtFull(totPlanned) + ' кг'}
          color="#059669" bg="#F0FDF4"
          icon={<CheckCircle size={20} />}
        />
        <BigKpi
          label="Жами буюртмалар"
          value={totOrders.toLocaleString('ru-RU')}
          sub="буюртма"
          color="#7C3AED" bg="#F5F3FF"
          icon={<Package size={20} />}
        />
        <BigKpi
          label="Бажарилиш %"
          value={avgCompletion.toFixed(1) + '%'}
          sub={`Рад: ${rejectPct.toFixed(2)}%`}
          color={avgCompletion >= 95 ? '#059669' : avgCompletion >= 80 ? '#D97706' : '#DC2626'}
          bg={avgCompletion >= 95 ? '#F0FDF4' : avgCompletion >= 80 ? '#FFFBEB' : '#FEF2F2'}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* ── Bags KPIs ── */}
      <div className={styles.miniKpiRow}>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiVal}>{totBags > 0 ? fmtFull(totBags) : '—'}</span>
          <span className={styles.miniKpiLabel}>Халта (50кг) — реал</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiVal}>{totBagsCeil > 0 ? fmtFull(totBagsCeil) : '—'}</span>
          <span className={styles.miniKpiLabel}>Халта (50кг) — тўлиқ</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiVal} style={{ color: '#DC2626' }}>{fmtFull(totRejected)} кг</span>
          <span className={styles.miniKpiLabel}>Рад этилди (жами)</span>
        </div>
        <div className={styles.miniKpi}>
          <span className={styles.miniKpiVal}>{totPlanned > 0 ? fmt(totPlanned - totProduced) : '—'}</span>
          <span className={styles.miniKpiLabel}>Режадан оғиш (кг)</span>
        </div>
      </div>

      {/* ── Per-product cards ── */}
      {inv.length > 0 && (
        <>
          <div className={styles.sectionLabel}><Package size={14} />МАҲСУЛОТ БЎЙИЧА ТАФСИЛОТ</div>
          <div className={styles.productGrid}>
            {inv.map((row, i) => {
              const produced   = n(row, 'TotalProduced', 'totalProduced');
              const planned    = n(row, 'TotalPlanned', 'totalPlanned');
              const orders     = n(row, 'TotalOrders', 'totalOrders');
              const rejected   = n(row, 'TotalRejected', 'totalRejected');
              const compPct    = n(row, 'CompletionPct', 'completionPct');
              const rejectP    = n(row, 'RejectPct', 'rejectPct');
              const bags50     = n(row, 'RawMat_Bags50kg', 'rawMat_Bags50kg', 'rawMatBags50kg');
              const bagsCeiled = n(row, 'RawMat_BagsCeiled', 'rawMat_BagsCeiled', 'rawMatBagsCeiled');
              const rmPlan     = n(row, 'RawMat_PlannedKg', 'rawMat_PlannedKg', 'rawMatPlannedKg');
              const rmActual   = n(row, 'RawMat_ActualKg', 'rawMat_ActualKg', 'rawMatActualKg');
              const itemName   = f(row, 'itemName', 'ItemName') || '—';
              const warehouse  = f(row, 'warehouse', 'Warehouse') || '';
              const uom        = f(row, 'uoM', 'UoM', 'uom') || 'кг';
              const status     = f(row, 'status', 'Status') || 'On Track';
              const deviation  = n(row, 'Deviation', 'deviation');
              const pct        = compPct || (planned > 0 ? (produced / planned) * 100 : 0);
              const rmEff      = rmPlan > 0 ? (rmActual / rmPlan) * 100 : 0;

              return (
                <div key={i} className={styles.productCard}>
                  <div className={styles.productCardTop}>
                    <div className={styles.productMeta}>
                      <span className={styles.warehouseTag}>{warehouse}</span>
                      <StatusBadge status={status} />
                    </div>
                    <div className={styles.productName}>{itemName}</div>
                    <div className={styles.productProduced}>{fmt(produced)}<span className={styles.productUom}>{uom}</span></div>
                  </div>

                  <div className={styles.productProgressWrap}>
                    <div className={styles.progressLabelRow}>
                      <span>Бажарилиш</span>
                      <span style={{ fontWeight:700, color: pct >= 95 ? '#059669' : pct >= 80 ? '#D97706' : '#DC2626' }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar pct={pct} />
                  </div>

                  <div className={styles.productStats}>
                    <div className={styles.pStat}>
                      <span className={styles.pStatVal}>{fmt(planned)}</span>
                      <span className={styles.pStatLabel}>Режа ({uom})</span>
                    </div>
                    <div className={styles.pStat}>
                      <span className={styles.pStatVal}>{orders.toLocaleString('ru-RU')}</span>
                      <span className={styles.pStatLabel}>Буюртмалар</span>
                    </div>
                    <div className={styles.pStat}>
                      <span className={styles.pStatVal} style={{ color: rejectP > 5 ? '#DC2626' : '#059669' }}>
                        {rejectP.toFixed(2)}%
                      </span>
                      <span className={styles.pStatLabel}>Рад %</span>
                    </div>
                  </div>

                  {/* Bags section */}
                  <div className={styles.bagsRow}>
                    <div className={styles.bagChip}>
                      <span className={styles.bagNum}>{bags50 > 0 ? fmtFull(bags50) : '—'}</span>
                      <span className={styles.bagLabel}>Халта 50кг</span>
                    </div>
                    <div className={styles.bagChip}>
                      <span className={styles.bagNum}>{bagsCeiled > 0 ? fmtFull(bagsCeiled) : '—'}</span>
                      <span className={styles.bagLabel}>Тўлиқ халта</span>
                    </div>
                    <div className={styles.bagChip}>
                      <span className={styles.bagNum} style={{ color:'#DC2626' }}>{fmt(rejected)}</span>
                      <span className={styles.bagLabel}>Рад ({uom})</span>
                    </div>
                  </div>

                  {/* Raw material section */}
                  {(rmPlan > 0 || rmActual > 0) && (
                    <div className={styles.rmSection}>
                      <div className={styles.rmTitle}>Хом ашё сарфи</div>
                      <div className={styles.rmRow}>
                        <div className={styles.rmStat}>
                          <span className={styles.rmVal}>{fmt(rmPlan)}</span>
                          <span className={styles.rmLbl}>Режа (кг)</span>
                        </div>
                        <div className={styles.rmStat}>
                          <span className={styles.rmVal}>{fmt(rmActual)}</span>
                          <span className={styles.rmLbl}>Факт (кг)</span>
                        </div>
                        <div className={styles.rmStat}>
                          <span className={styles.rmVal} style={{ color: rmEff > 105 ? '#DC2626' : rmEff > 100 ? '#D97706' : '#059669' }}>
                            {rmEff.toFixed(1)}%
                          </span>
                          <span className={styles.rmLbl}>Самарадорлик</span>
                        </div>
                      </div>
                      <ProgressBar pct={Math.min(rmEff, 110)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Production chart + raw mat chart ── */}
      <div className={styles.mainGrid}>
        {/* Production plan vs fact */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Режа vs Факт ишлаб чиқариш</h3>
            <Link to="/inventory-transfer" className={styles.seeAll}>Тафсилот <ArrowRight size={12} /></Link>
          </div>
          <div className={styles.chartWrap}>
            {prodChartData.length === 0 ? (
              <div className={styles.empty}>Маълумот йўқ</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={prodChartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} width={65} />
                  <Tooltip formatter={(v, k) => [fmtFull(v) + ' кг', k]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Режа" fill="#CBD5E1" radius={[3,3,0,0]} />
                  <Bar dataKey="Факт" fill="#1B3A8C" radius={[3,3,0,0]} />
                  <Bar dataKey="Рад" fill="#FCA5A5" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Raw material receipt vs consumption */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Хом ашё кириш / Сарф динамикаси</h3>
            {(rcptQ.isFetching || consQ.isFetching) && <RefreshCw size={14} className={styles.spinning} />}
          </div>
          <div className={styles.chartWrap}>
            {rcChartData.length === 0 ? (
              <div className={styles.empty}>Маълумот йўқ</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={rcChartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} width={60} />
                  <Tooltip formatter={(v, k) => [fmtFull(v) + ' кг', k]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Кириш" fill="#1B3A8C" radius={[3,3,0,0]} />
                  <Bar dataKey="Сарф" fill="#D97706" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Raw Materials section label ── */}
      <div className={styles.sectionLabel}>
        <Package size={14} />
        ХОМ АШЁ ҚОЛДИҚЛАРИ
      </div>

      {/* ── Aggregate raw material from inv-transfer ── */}
      {inv.length > 0 && (totRmPlan > 0 || totRmActual > 0) && (
        <div className={styles.rmSummaryGrid}>
          <div className={styles.rmSummaryCard} style={{ borderLeft: '3px solid #1B3A8C' }}>
            <div className={styles.rmSumVal}>{fmt(totRmPlan)}</div>
            <div className={styles.rmSumLabel}>Хом ашё режаси (кг)</div>
            <div className={styles.rmSumSub}>{fmtFull(totRmPlan)} кг</div>
          </div>
          <div className={styles.rmSummaryCard} style={{ borderLeft: '3px solid #D97706' }}>
            <div className={styles.rmSumVal}>{fmt(totRmActual)}</div>
            <div className={styles.rmSumLabel}>Реал сарф (кг)</div>
            <div className={styles.rmSumSub}>{fmtFull(totRmActual)} кг</div>
          </div>
          <div className={styles.rmSummaryCard} style={{ borderLeft: '3px solid #059669' }}>
            <div className={styles.rmSumVal} style={{ color: rmEfficiency > 105 ? '#DC2626' : '#059669' }}>
              {rmEfficiency.toFixed(1)}%
            </div>
            <div className={styles.rmSumLabel}>Самарадорлик</div>
            <div className={styles.rmSumSub}>Реал / Режа нисбати</div>
          </div>
          <div className={styles.rmSummaryCard} style={{ borderLeft: '3px solid #7C3AED' }}>
            <div className={styles.rmSumVal}>{totBagsCeil > 0 ? fmtFull(totBagsCeil) : fmtFull(totBags)}</div>
            <div className={styles.rmSumLabel}>Жами халталар</div>
            <div className={styles.rmSumSub}>50кг / халта</div>
          </div>
        </div>
      )}

      {/* ── Stock from raw-materials-stock API ── */}
      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Хом ашё омбор қолдиқлари</h3>
            <Link to="/raw-materials-stock" className={styles.seeAll}>Барчаси <ArrowRight size={12} /></Link>
          </div>
          {stockQ.isLoading ? (
            <div className={styles.empty}><div className={styles.spinner} /></div>
          ) : (
            <div className={styles.miniTable}>
              {(stockQ.data || []).map((row, i) => {
                const total = n(row, 'total', 'Total', 'onHand', 'OnHand');
                const bar = totalStock > 0 ? (total / totalStock) * 100 : 0;
                return (
                  <div key={i} className={styles.stockRow}>
                    <div className={styles.stockName}>{f(row, 'itemName', 'ItemName')}</div>
                    <div style={{ flex:1, margin:'0 12px' }}>
                      <div style={{ height:4, background:'#F1F5F9', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${bar}%`, background:'#1B3A8C', borderRadius:2 }} />
                      </div>
                    </div>
                    <span className={styles.stockBadge} style={{ background:'#EFF6FF', color:'#1B3A8C' }}>
                      {fmt(total)} кг
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Silos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Силослар ҳолати</h3>
            <Link to="/silo-stock" className={styles.seeAll}>Барчаси <ArrowRight size={12} /></Link>
          </div>
          <div className={styles.siloGrid}>
            {Object.entries(
              (siloQ.data || []).reduce((acc, r) => {
                const key = f(r, 'silos', 'Silos') || 'Силос';
                if (!acc[key]) acc[key] = { name: f(r, 'name', 'Name') || key, items: [] };
                acc[key].items.push(r);
                return acc;
              }, {})
            ).map(([key, silo]) => {
              const total = silo.items.reduce((s, r) => s + n(r, 'onHand', 'OnHand'), 0);
              return (
                <div key={key} className={styles.siloCard}>
                  <div className={styles.siloTitle}>{silo.name || key}</div>
                  <div className={styles.siloTotal}>{fmt(total)} кг</div>
                  <div className={styles.siloItems}>
                    {silo.items.map((item, j) => (
                      <div key={j} className={styles.siloItem}>
                        <span>{f(item, 'sement', 'Sement', 'itemName')}</span>
                        <span className={styles.siloQty}>{fmt(n(item, 'onHand', 'OnHand'))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
