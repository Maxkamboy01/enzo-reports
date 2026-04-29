import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COLS = [
  { key: 'docDate', label: 'Сана', width: 110 },
  { key: 'klinker', label: 'Клинкер (кг)', right: true, render: v => fmtFull(v) },
  { key: 'bazalt', label: 'Базалт (кг)', right: true, render: v => fmtFull(v) },
  { key: 'oxaqtosh', label: 'Охактош (кг)', right: true, render: v => fmtFull(v) },
  { key: 'gips', label: 'Гипс (кг)', right: true, render: v => fmtFull(v) },
  { key: 'bentanint', label: 'Бентанит (кг)', right: true, render: v => fmtFull(v) },
  { key: 'zala', label: 'Зала (кг)', right: true, render: v => fmtFull(v) },
];

const BARS = [
  { key: 'klinker', label: 'Клинкер', color: '#1B3A8C' },
  { key: 'bazalt', label: 'Базалт', color: '#059669' },
  { key: 'oxaqtosh', label: 'Охактош', color: '#D97706' },
  { key: 'gips', label: 'Гипс', color: '#7C3AED' },
  { key: 'bentanint', label: 'Бентанит', color: '#DC2626' },
  { key: 'zala', label: 'Зала', color: '#0891B2' },
];

export default function RawMaterialReceipt({ fetcher = dash.rawMaterialReceipt }) {
  return (
    <DataPage
      queryKey="raw-material-receipt"
      fetcher={fetcher}
      title="Хом ашё кириши"
      subtitle="Кунлик кириш хисоботи"
      columns={COLS}
      topContent={(rows) => rows.length === 0 ? null : (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 12 }}>
            Кунлик кириш диаграммаси
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rows.map(r => ({ date: r.docDate?.slice(5), ...Object.fromEntries(BARS.map(b => [b.label, parseFloat(r[b.key] || 0)])) }))} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} width={55} />
              <Tooltip formatter={(v) => [v.toLocaleString('ru-RU') + ' кг']} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {BARS.map(b => <Bar key={b.key} dataKey={b.label} fill={b.color} radius={[2,2,0,0]} stackId="a" />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    />
  );
}
