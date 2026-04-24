import DataPage from '../components/ui/DataPage';
import { dash, fmtN } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';

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
  { key: 'target',       label: 'Мақсад',        right: true, render: v => v != null ? fmtN(v, 3) : fmtN(TARGET, 3) },
];

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
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 9 }} />
          <YAxis domain={['auto','auto']} tick={{ fontSize: 11 }} width={55} />
          <Tooltip formatter={v => [fmtN(v, 3)]} />
          <ReferenceLine y={TARGET} stroke="#059669" strokeDasharray="5 3" label={{ value: `Мақсад ${TARGET}`, position: 'right', fontSize: 10, fill: '#059669' }} />
          <Line type="monotone" dataKey="factor" name="Клинкер омил" stroke="#1B3A8C" strokeWidth={2} dot={{ r: 2 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ClinkerFactor() {
  return (
    <DataPage
      queryKey="clinker-factor"
      fetcher={dash.clinkerFactor}
      title="Клинкер омил"
      subtitle="Clinker Factor — цемент таркибидаги клинкер улуши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
