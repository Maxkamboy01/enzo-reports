import DataPage from '../components/ui/DataPage';
import { dash, fmtFull, fmtN } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const COLS = [
  { key: 'docDate',    label: 'Сана',      width: 110 },
  { key: 'shift',      label: 'Смена',     width: 80 },
  { key: 'itemCode',   label: 'Код' },
  { key: 'itemName',   label: 'Маҳсулот' },
  { key: 'quantity',   label: 'Ҳажм (т)',  right: true, render: v => fmtN(v) },
  { key: 'uom',        label: 'Бирлик',    width: 70 },
  { key: 'warehouse',  label: 'Склад' },
];

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
  cursor: { fill: 'rgba(27,58,140,0.04)' },
};

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const d = r.docDate?.slice(5, 10) ?? r.docDate ?? '—';
    grouped[d] = (grouped[d] || 0) + (parseFloat(r.quantity) || 0);
  });
  const data = Object.entries(grouped).map(([date, qty]) => ({ date, qty }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>
        Кунлик ишлаб чиқариш ҳажми
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 8, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
            height={65}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} width={58} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <Tooltip
            {...tooltipStyle}
            formatter={v => [fmtFull(v) + ' т', 'Ҳажм']}
          />
          <Bar dataKey="qty" name="Ҳажм" fill="#1B3A8C" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VolumeDaily({ fetcher = dash.volumeDaily, queryKey = 'volume-daily' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Кунлик ишлаб чиқариш ҳажми"
      subtitle="Volume Daily — ишлаб чиқариш бўйича кунлик маълумот"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
