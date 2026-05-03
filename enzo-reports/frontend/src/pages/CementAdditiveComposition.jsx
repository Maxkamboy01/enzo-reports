import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#1B3A8C','#D97706','#059669','#7C3AED','#DC2626','#0891B2','#64748B','#F59E0B'];

const COLS = [
  { key: 'docDate',   label: 'Сана',          width: 110 },
  { key: 'itemCode',  label: 'Қўшимча коди' },
  { key: 'itemName',  label: 'Қўшимча номи' },
  { key: 'quantity',  label: 'Миқдор (т)',    right: true, render: v => fmtN(v) },
  { key: 'pct',       label: 'Улуш %',        right: true, render: v => {
    const n = parseFloat(v) || 0;
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        <span style={{ flex: 1, maxWidth: 60, height: 5, borderRadius: 3, background: '#F1F5F9', overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: `${Math.min(n, 100)}%`, background: '#1B3A8C', borderRadius: 3 }} />
        </span>
        {fmtN(n)}%
      </span>
    );
  }},
  { key: 'cementQty', label: 'Цемент (т)',    right: true, render: v => fmtN(v) },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const k = r.itemName || r.itemCode || '—';
    grouped[k] = (grouped[k] || 0) + (parseFloat(r.quantity) || 0);
  });
  const data = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.slice(0, 22), value }));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Қўшимчалар таркиби</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={v => [fmtN(v) + ' т']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Миқдор бўйича</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={130} />
            <Tooltip formatter={v => [fmtN(v) + ' т']} />
            <Bar dataKey="value" name="Миқдор" radius={[0,3,3,0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CementAdditiveComposition({ fetcher = dash.cementAdditiveComposition, queryKey = 'cement-additive-composition' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Цемент қўшимчалари таркиби"
      subtitle="Cement Additive Composition — цемент таркибидаги қўшимчалар улуши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
