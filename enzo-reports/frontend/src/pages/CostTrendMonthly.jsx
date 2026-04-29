import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

const COLS = [
  { key: 'month',      label: 'Ой',              width: 100 },
  { key: 'category',  label: 'Харажат тури' },
  { key: 'amount',    label: 'Сумма (сўм)',       right: true, render: v => fmtFull(v) },
  { key: 'costPerTon',label: 'Сўм/тонна',         right: true, render: v => v != null ? fmtFull(v) : '—' },
  { key: 'production',label: 'Ишлаб чиқариш (т)', right: true, render: v => fmtN(v) },
  { key: 'trend',     label: 'Тренд %',           right: true, render: v => {
    const n = parseFloat(v) || 0;
    return <span style={{ color: n > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>{n > 0 ? '+' : ''}{fmtN(n)}%</span>;
  }},
];

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
};

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const k = r.month || r.docDate?.slice(0, 7) || '—';
    grouped[k] = (grouped[k] || 0) + (parseFloat(r.amount) || 0);
  });
  const data = Object.entries(grouped).sort().map(([month, amount]) => ({ month, amount }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Ойлик харажат тренди</div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 60 }}>
          <defs>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B3A8C" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1B3A8C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
            height={65}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            width={75}
            tickFormatter={v => v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v}
          />
          <Tooltip {...tooltipStyle} formatter={v => [fmtFull(v) + ' сўм', 'Харажат']} />
          <Area type="monotone" dataKey="amount" name="Харажат" stroke="#1B3A8C" strokeWidth={2.5} fill="url(#costGrad)" dot={{ r: 4, fill: '#1B3A8C' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CostTrendMonthly({ fetcher = dash.costTrendMonthly }) {
  return (
    <DataPage
      queryKey="cost-trend-monthly"
      fetcher={fetcher}
      title="Ойлик харажат тренди"
      subtitle="Cost Trend Monthly — ойлар кесимида харажат динамикаси"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
