import DataPage from '../components/ui/DataPage';
import { dash, fmtFull, fmtN } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
  cursor: { fill: 'rgba(27,58,140,0.04)' },
};

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 30).map(r => ({
    label: r.docDate?.slice(5, 10) ?? '',
    shift: r.shift ?? '',
    Режа: parseFloat(r.plannedQty) || 0,
    Факт: parseFloat(r.actualQty) || 0,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Смена бўйича режа vs факт</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="25%" margin={{ top: 8, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
            height={65}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} width={58} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <Tooltip
            {...tooltipStyle}
            formatter={v => [fmtFull(v) + ' т']}
            labelFormatter={(label, payload) => {
              const shift = payload?.[0]?.payload?.shift;
              return shift ? `${label} · Смена ${shift}` : label;
            }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
          <Bar dataKey="Режа" fill="#CBD5E1" radius={[3,3,0,0]} />
          <Bar dataKey="Факт" fill="#1B3A8C" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ShiftPerformance({ fetcher = dash.shiftPerformance, queryKey = 'shift-performance' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Смена кўрсаткичлари"
      subtitle="Shift Performance — смена бўйича ишлаб чиқариш самарадорлиги"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
