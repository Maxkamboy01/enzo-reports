import DataPage from '../components/ui/DataPage';
import { dash, fmtFull, fmtN } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';

const pct = (actual, plan) => {
  const p = parseFloat(plan) || 0;
  const a = parseFloat(actual) || 0;
  return p > 0 ? (a / p) * 100 : 0;
};

const COLS = [
  { key: 'docDate',    label: 'Сана',       width: 110 },
  { key: 'shift',      label: 'Смена',      width: 80 },
  { key: 'itemName',   label: 'Маҳсулот' },
  { key: 'plannedQty', label: 'Режа (т)',   right: true, render: v => fmtN(v) },
  { key: 'actualQty',  label: 'Факт (т)',   right: true, render: (v, row) => {
    const p = pct(v, row.plannedQty);
    const color = p >= 100 ? '#059669' : p >= 80 ? '#D97706' : '#DC2626';
    return <span style={{ color, fontWeight: 600 }}>{fmtN(v)} <span style={{ fontSize: '.7rem', fontWeight: 400 }}>({p.toFixed(0)}%)</span></span>;
  }},
  { key: 'efficiency', label: 'КПД %',      right: true, render: v => v != null ? fmtN(v) + '%' : '—' },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 30).map(r => ({
    label: `${r.docDate?.slice(5, 10) ?? ''} ${r.shift ?? ''}`,
    Режа: parseFloat(r.plannedQty) || 0,
    Факт: parseFloat(r.actualQty) || 0,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Смена бўйича режа vs факт</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <Tooltip formatter={v => [fmtFull(v) + ' т']} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Режа" fill="#CBD5E1" radius={[3,3,0,0]} />
          <Bar dataKey="Факт" fill="#1B3A8C" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ShiftPerformance() {
  return (
    <DataPage
      queryKey="shift-performance"
      fetcher={dash.shiftPerformance}
      title="Смена кўрсаткичлари"
      subtitle="Shift Performance — смена бўйича ишлаб чиқариш самарадорлиги"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
