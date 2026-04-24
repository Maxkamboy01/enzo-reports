import DataPage from '../../components/ui/DataPage';
import { dashShifer } from '../../services/apiShifer';
import { fmtN, fmtFull } from '../../services/api';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const COLS = [
  { key: 'docDate',       label: 'Сана',          width: 110 },
  { key: 'itemCode',      label: 'Код' },
  { key: 'itemName',      label: 'Маҳсулот' },
  { key: 'whsCode',       label: 'Склад' },
  { key: 'totalOrders',   label: 'Буюртмалар',     right: true, render: v => v?.toLocaleString('ru-RU') ?? '—' },
  { key: 'totalPlanned',  label: 'Режа',           right: true, render: v => fmtFull(v) },
  { key: 'totalProduced', label: 'Ишлаб чиқарилди',right: true, render: (v, row) => {
    const pct = row.totalPlanned > 0 ? (parseFloat(v) / parseFloat(row.totalPlanned)) * 100 : 0;
    const color = pct >= 95 ? '#059669' : pct >= 80 ? '#D97706' : '#DC2626';
    return (
      <span style={{ color, fontWeight: 600 }}>
        {fmtFull(v)}
        <span style={{ fontSize: '.7rem', fontWeight: 400, marginLeft: 4 }}>({pct.toFixed(0)}%)</span>
      </span>
    );
  }},
  { key: 'totalRejected', label: 'Рад',            right: true, render: v => <span style={{ color: '#DC2626' }}>{fmtFull(v)}</span> },
  { key: 'completionPct', label: 'Бажарилиш %',    right: true, render: v => fmtN(v) + '%' },
  { key: 'deviation',     label: 'Оғиш',           right: true, render: v => {
    const n = parseFloat(v) || 0;
    return <span style={{ color: n < 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>{n > 0 ? '+' : ''}{fmtFull(n)}</span>;
  }},
  { key: 'status',        label: 'Статус',         render: v => {
    const colors = { 'On Track': '#059669', 'Warning': '#D97706', 'Off Track': '#DC2626' };
    const bgs    = { 'On Track': '#D1FAE5', 'Warning': '#FEF3C7', 'Off Track': '#FEE2E2' };
    const s = v || 'On Track';
    return <span style={{ background: bgs[s] || '#F1F5F9', color: colors[s] || '#475569',
      padding: '2px 8px', borderRadius: 10, fontSize: '.72rem', fontWeight: 700 }}>{s}</span>;
  }},
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 25).map(r => ({
    name: (r.itemName || r.itemCode || '—').slice(0, 14),
    Режа:   parseFloat(r.totalPlanned) || 0,
    Факт:   parseFloat(r.totalProduced) || 0,
    Рад:    parseFloat(r.totalRejected) || 0,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Ишлаб чиқариш: Режа vs Факт</div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} width={65} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
          <Tooltip formatter={v => [fmtFull(v)]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Режа" fill="#CBD5E1" radius={[3,3,0,0]} />
          <Bar dataKey="Факт" fill="#059669" radius={[3,3,0,0]} />
          <Bar dataKey="Рад"  fill="#FCA5A5" radius={[3,3,0,0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function NoTokenBanner() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FEF3C7', border:'1px solid #FDE68A',
      borderRadius:8, padding:'12px 16px', margin:'0 0 16px', fontSize:'.82rem', color:'#92400E' }}>
      <AlertCircle size={16} />
      Шифер базаси токени уланмаган. Сайдбар тагидаги <strong>Базалар</strong> тугмасини босинг.
    </div>
  );
}

export default function ShiferProductionPerformance() {
  const { dbTokens } = useAuth();
  return (
    <DataPage
      queryKey="shifer-production-performance"
      fetcher={dashShifer.productionPerformReports}
      title="Шифер — Ишлаб чиқариш ҳисоботи"
      subtitle="Production Performance Reports · backend-greymix.bis-apps.com"
      columns={COLS}
      renderFilters={dbTokens.shifer ? undefined : false}
      topContent={(rows) => (
        <>
          {!dbTokens.shifer && <NoTokenBanner />}
          <Chart rows={rows} />
        </>
      )}
    />
  );
}
