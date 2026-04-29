import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COLS = [
  { key: 'docDate', label: 'Сана', width: 110 },
  { key: 'klinker', label: 'Клинкер (кг)', right: true, render: v => fmtFull(v) },
  { key: 'bazalt', label: 'Базалт (кг)', right: true, render: v => fmtFull(v) },
  { key: 'oxaqtosh', label: 'Охактош (кг)', right: true, render: v => fmtFull(v) },
  { key: 'gips', label: 'Гипс (кг)', right: true, render: v => fmtFull(v) },
  { key: 'bentanint', label: 'Бентанит (кг)', right: true, render: v => fmtFull(v) },
  { key: 'zala', label: 'Зала (кг)', right: true, render: v => fmtFull(v) },
];

const AREAS = [
  { key: 'klinker', label: 'Клинкер', color: '#1B3A8C' },
  { key: 'oxaqtosh', label: 'Охактош', color: '#D97706' },
  { key: 'gips', label: 'Гипс', color: '#7C3AED' },
  { key: 'zala', label: 'Зала', color: '#0891B2' },
];

export default function RawMaterialConsumption({ fetcher = dash.rawMaterialConsumption }) {
  return (
    <DataPage
      queryKey="raw-material-consumption"
      fetcher={fetcher}
      title="Хом ашё сарфи"
      subtitle="Кунлик истеъмол хисоботи"
      columns={COLS}
      topContent={(rows) => rows.length === 0 ? null : (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 12 }}>Кунлик сарф тренди</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={rows.map(r => ({ date: r.docDate?.slice(5), ...Object.fromEntries(AREAS.map(a => [a.label, parseFloat(r[a.key] || 0)])) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={55} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
              <Tooltip formatter={(v) => [v.toLocaleString('ru-RU') + ' кг']} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {AREAS.map(a => (
                <Area key={a.key} type="monotone" dataKey={a.label} stroke={a.color} fill={a.color + '20'} strokeWidth={2} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    />
  );
}
