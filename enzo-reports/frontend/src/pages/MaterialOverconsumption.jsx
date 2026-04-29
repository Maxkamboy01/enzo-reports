import DataPage from '../components/ui/DataPage';
import { dash, fmtN } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const COLS = [
  { key: 'docDate',         label: 'Сана',         width: 110 },
  { key: 'itemCode',        label: 'Код' },
  { key: 'itemName',        label: 'Материал' },
  { key: 'plannedQty',      label: 'Режа (кг)',     right: true, render: v => fmtN(v) },
  { key: 'actualQty',       label: 'Факт (кг)',     right: true, render: v => fmtN(v) },
  { key: 'overconsumption', label: 'Ортиқча (кг)',  right: true, render: v => {
    const n = parseFloat(v) || 0;
    return <span style={{ color: n > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>{n > 0 ? '+' : ''}{fmtN(n)}</span>;
  }},
  { key: 'overconsumptionPct', label: 'Ортиқча %', right: true, render: v => {
    const n = parseFloat(v) || 0;
    return <span style={{ color: n > 5 ? '#DC2626' : n > 0 ? '#D97706' : '#059669' }}>{n > 0 ? '+' : ''}{fmtN(n)}%</span>;
  }},
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows
    .filter(r => (parseFloat(r.overconsumption) || 0) > 0)
    .sort((a, b) => (parseFloat(b.overconsumption) || 0) - (parseFloat(a.overconsumption) || 0))
    .slice(0, 15)
    .map(r => ({
      name: (r.itemName || '—').slice(0, 18),
      Ортиқча: parseFloat(r.overconsumption) || 0,
    }));
  if (!data.length) return null;
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Топ ортиқча сарф (кг)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
          <Tooltip formatter={v => [fmtN(v) + ' кг']} />
          <Bar dataKey="Ортиқча" fill="#EF4444" radius={[0,3,3,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MaterialOverconsumption({ fetcher = dash.materialOverconsumption }) {
  return (
    <DataPage
      queryKey="material-overconsumption"
      fetcher={fetcher}
      title="Ортиқча материал сарфи"
      subtitle="Material Overconsumption — норма ошган сарф таҳлили"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
