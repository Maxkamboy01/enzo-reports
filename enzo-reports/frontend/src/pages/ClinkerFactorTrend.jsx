import DataPage from '../components/ui/DataPage';
import { dash, fmtN } from '../services/api';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';

const COLS = [
  { key: 'period',       label: 'Давр',         width: 110 },
  { key: 'avgFactor',    label: 'Ўртача омил',  right: true, render: v => fmtN(v, 3) },
  { key: 'minFactor',    label: 'Минимум',       right: true, render: v => fmtN(v, 3) },
  { key: 'maxFactor',    label: 'Максимум',      right: true, render: v => fmtN(v, 3) },
  { key: 'cementQty',   label: 'Цемент (т)',     right: true, render: v => fmtN(v) },
  { key: 'clinkerQty',  label: 'Клинкер (т)',    right: true, render: v => fmtN(v) },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.map(r => ({
    period: r.period || r.month || r.docDate?.slice(0, 7) || '—',
    avgFactor: parseFloat(r.avgFactor || r.clinkerFactor) || null,
    cementQty: parseFloat(r.cementQty) || 0,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Клинкер омил тренди</div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="period" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="factor" orientation="left" domain={['auto','auto']} tick={{ fontSize: 11 }} width={55} />
          <YAxis yAxisId="qty" orientation="right" tick={{ fontSize: 10 }} width={60} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
          <Tooltip />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine yAxisId="factor" y={0.72} stroke="#059669" strokeDasharray="5 3" />
          <Bar yAxisId="qty" dataKey="cementQty" name="Цемент (т)" fill="#E2E8F0" radius={[3,3,0,0]} />
          <Line yAxisId="factor" type="monotone" dataKey="avgFactor" name="Ўртача омил" stroke="#1B3A8C" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ClinkerFactorTrend() {
  return (
    <DataPage
      queryKey="clinker-factor-trend"
      fetcher={dash.clinkerFactorTrend}
      title="Клинкер омил тренди"
      subtitle="Clinker Factor Trend — даврий клинкер омил ўзгариши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
