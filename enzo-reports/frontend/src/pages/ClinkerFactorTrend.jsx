import DataPage from '../components/ui/DataPage';
import { dash, fmtN } from '../services/api';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';

const COLS = [
  { key: 'period',      label: 'Давр',        width: 110 },
  { key: 'avgFactor',   label: 'Ўртача омил', right: true, render: v => fmtN(v, 3) },
  { key: 'minFactor',   label: 'Минимум',      right: true, render: v => fmtN(v, 3) },
  { key: 'maxFactor',   label: 'Максимум',     right: true, render: v => fmtN(v, 3) },
  { key: 'cementQty',  label: 'Цемент (т)',    right: true, render: v => fmtN(v) },
  { key: 'clinkerQty', label: 'Клинкер (т)',   right: true, render: v => fmtN(v) },
];

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
};

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
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 60, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
            height={65}
            interval="preserveStartEnd"
          />
          <YAxis yAxisId="factor" orientation="left" domain={['auto','auto']} tick={{ fontSize: 11, fill: '#6B7280' }} width={52} />
          <YAxis yAxisId="qty" orientation="right" tick={{ fontSize: 10, fill: '#6B7280' }} width={58} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
          <Tooltip {...tooltipStyle} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
          <ReferenceLine yAxisId="factor" y={0.72} stroke="#059669" strokeDasharray="5 3" />
          <Bar yAxisId="qty" dataKey="cementQty" name="Цемент (т)" fill="#E2E8F0" radius={[3,3,0,0]} />
          <Line yAxisId="factor" type="monotone" dataKey="avgFactor" name="Ўртача омил" stroke="#1B3A8C" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ClinkerFactorTrend({ fetcher = dash.clinkerFactorTrend, queryKey = 'clinker-factor-trend' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Клинкер омил тренди"
      subtitle="Clinker Factor Trend — даврий клинкер омил ўзгариши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
