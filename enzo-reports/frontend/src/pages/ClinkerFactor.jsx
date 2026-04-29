import DataPage from '../components/ui/DataPage';
import { dash, fmtN } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const TARGET = 0.72;

const COLS = [
  { key: 'docDate',      label: 'Сана',          width: 110 },
  { key: 'itemCode',     label: 'Маҳсулот коди' },
  { key: 'itemName',     label: 'Маҳсулот' },
  { key: 'clinkerQty',   label: 'Клинкер (т)',   right: true, render: v => fmtN(v) },
  { key: 'cementQty',    label: 'Цемент (т)',     right: true, render: v => fmtN(v) },
  { key: 'clinkerFactor',label: 'Клинкер омил',  right: true, render: v => {
    const n = parseFloat(v) || 0;
    const color = n > TARGET + 0.03 ? '#DC2626' : n < TARGET - 0.03 ? '#D97706' : '#059669';
    return <span style={{ color, fontWeight: 700 }}>{fmtN(n, 3)}</span>;
  }},
  { key: 'target', label: 'Мақсад', right: true, render: v => v != null ? fmtN(v, 3) : fmtN(TARGET, 3) },
];

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
};

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 60).map(r => ({
    date: r.docDate?.slice(5, 10) ?? '—',
    factor: parseFloat(r.clinkerFactor) || null,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>
        Клинкер омил динамикаси (мақсад: {TARGET})
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 50, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
            height={65}
            interval="preserveStartEnd"
          />
          <YAxis domain={['auto','auto']} tick={{ fontSize: 11, fill: '#6B7280' }} width={52} />
          <Tooltip {...tooltipStyle} formatter={v => [fmtN(v, 3), 'Клинкер омил']} />
          <ReferenceLine
            y={TARGET}
            stroke="#059669"
            strokeDasharray="5 3"
            label={{ value: `Мақсад ${TARGET}`, position: 'right', fontSize: 11, fill: '#059669', fontWeight: 600 }}
          />
          <Line type="monotone" dataKey="factor" name="Клинкер омил" stroke="#1B3A8C" strokeWidth={2.5} dot={{ r: 2.5 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ClinkerFactor({ fetcher = dash.clinkerFactor }) {
  return (
    <DataPage
      queryKey="clinker-factor"
      fetcher={fetcher}
      title="Клинкер омил"
      subtitle="Clinker Factor — цемент таркибидаги клинкер улуши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
