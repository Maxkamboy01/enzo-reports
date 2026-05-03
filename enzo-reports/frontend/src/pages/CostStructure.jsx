import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#1B3A8C','#D97706','#059669','#7C3AED','#DC2626','#0891B2','#64748B','#F59E0B'];

const COLS = [
  { key: 'docDate',   label: 'Сана',         width: 110 },
  { key: 'category', label: 'Харажат тури' },
  { key: 'itemName', label: 'Номланиши' },
  { key: 'amount',   label: 'Сумма (сўм)',   right: true, render: v => fmtFull(v) },
  { key: 'currency', label: 'Валюта',        width: 70 },
  { key: 'pct',      label: 'Улуш %',        right: true, render: v => v != null ? fmtN(v) + '%' : '—' },
];

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const k = r.category || r.itemName || '—';
    grouped[k] = (grouped[k] || 0) + (parseFloat(r.amount) || 0);
  });
  const data = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.length > 28 ? name.slice(0, 26) + '…' : name, value }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Харажат структураси</div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={100}
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={v => [fmtFull(v) + ' сўм']} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Тури бўйича суммалар</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickFormatter={v => v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v}
            />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} width={140} />
            <Tooltip {...tooltipStyle} formatter={v => [fmtFull(v) + ' сўм']} />
            <Bar dataKey="value" name="Сумма" radius={[0,4,4,0]}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CostStructure({ fetcher = dash.costStructure, queryKey = 'cost-structure' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Харажат структураси"
      subtitle="Cost Structure — ишлаб чиқариш харажатлари тузилмаси"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
