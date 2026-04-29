import DataPage from '../components/ui/DataPage';
import { dash, fmtN } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';

const COLS = [
  { key: 'docDate',     label: 'Сана',        width: 110 },
  { key: 'itemCode',    label: 'Материал коди' },
  { key: 'itemName',    label: 'Материал' },
  { key: 'bomQty',      label: 'BOM (кг)',     right: true, render: v => fmtN(v) },
  { key: 'actualQty',   label: 'Факт (кг)',    right: true, render: (v, row) => {
    const bom = parseFloat(row.bomQty) || 0;
    const act = parseFloat(v) || 0;
    const diff = act - bom;
    const color = diff > 0 ? '#DC2626' : '#059669';
    return (
      <span>
        {fmtN(act)}{' '}
        <span style={{ color, fontSize: '.7rem' }}>
          ({diff > 0 ? '+' : ''}{fmtN(diff)})
        </span>
      </span>
    );
  }},
  { key: 'variance',    label: 'Фарқ (кг)',    right: true, render: v => {
    const n = parseFloat(v) || 0;
    return <span style={{ color: n > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>{n > 0 ? '+' : ''}{fmtN(n)}</span>;
  }},
  { key: 'variancePct', label: 'Фарқ %',       right: true, render: v => v != null ? fmtN(v) + '%' : '—' },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 20).map(r => ({
    name: (r.itemName || r.itemCode || '?').slice(0, 16),
    BOM: parseFloat(r.bomQty) || 0,
    Факт: parseFloat(r.actualQty) || 0,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>BOM vs Факт сарф</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 11 }} width={65} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <Tooltip formatter={v => [fmtN(v) + ' кг']} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="BOM" fill="#94A3B8" radius={[3,3,0,0]} />
          <Bar dataKey="Факт" fill="#1B3A8C" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MaterialVsBom({ fetcher = dash.materialVsBom }) {
  return (
    <DataPage
      queryKey="material-vs-bom"
      fetcher={fetcher}
      title="Материал vs BOM"
      subtitle="Реал сарф BOM норматив билан солиштириш"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
