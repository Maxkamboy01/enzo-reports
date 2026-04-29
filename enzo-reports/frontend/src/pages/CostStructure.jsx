import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#1B3A8C','#D97706','#059669','#7C3AED','#DC2626','#0891B2','#64748B','#F59E0B'];

const COLS = [
  { key: 'docDate',    label: 'Сана',         width: 110 },
  { key: 'category',  label: 'Харажат тури' },
  { key: 'itemName',  label: 'Номланиши' },
  { key: 'amount',    label: 'Сумма (сўм)',   right: true, render: v => fmtFull(v) },
  { key: 'currency',  label: 'Валюта',        width: 70 },
  { key: 'pct',       label: 'Улуш %',        right: true, render: v => v != null ? fmtN(v) + '%' : '—' },
];

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
    .map(([name, value]) => ({ name: name.slice(0, 24), value }));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Харажат структураси</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ pct }) => `${(pct*100).toFixed(0)}%`} labelLine={false}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={v => [fmtFull(v) + ' сўм']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Тури бўйича суммалар</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={130} />
            <Tooltip formatter={v => [fmtFull(v) + ' сўм']} />
            <Bar dataKey="value" name="Сумма" radius={[0,3,3,0]}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CostStructure({ fetcher = dash.costStructure }) {
  return (
    <DataPage
      queryKey="cost-structure"
      fetcher={fetcher}
      title="Харажат структураси"
      subtitle="Cost Structure — ишлаб чиқариш харажатлари тузилмаси"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
