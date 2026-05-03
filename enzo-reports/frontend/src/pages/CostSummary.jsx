import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const COLS = [
  { key: 'docDate',     label: 'Сана',         width: 110 },
  { key: 'category',   label: 'Тури' },
  { key: 'itemName',   label: 'Номланиши' },
  { key: 'totalAmount', label: 'Жами (сўм)',   right: true, render: v => fmtFull(v) },
  { key: 'costPerTon',  label: 'Тонна нархи',  right: true, render: v => v != null ? fmtFull(v) + ' сўм/т' : '—' },
  { key: 'production',  label: 'Ишлаб чиқариш (т)', right: true, render: v => fmtN(v) },
];

const COLORS = ['#1B3A8C','#D97706','#059669','#7C3AED','#DC2626','#0891B2','#64748B','#F59E0B'];

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
  cursor: { fill: 'rgba(27,58,140,0.04)' },
};

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 20).map((r, i) => ({
    label: r.docDate?.slice(5, 10) || r.category || '—',
    Жами: parseFloat(r.totalAmount) || 0,
    color: COLORS[i % COLORS.length],
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Харажат жами динамикаси</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="30%" margin={{ top: 8, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
            height={65}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            width={72}
            tickFormatter={v => v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v}
          />
          <Tooltip {...tooltipStyle} formatter={v => [fmtFull(v) + ' сўм', 'Харажат']} />
          <Bar dataKey="Жами" radius={[4,4,0,0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CostSummary({ fetcher = dash.costSummary, queryKey = 'cost-summary' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Харажат хулосаси"
      subtitle="Cost Summary — жами харажатлар якуний кўриниши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
