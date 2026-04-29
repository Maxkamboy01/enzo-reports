import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';

const COLS = [
  { key: 'docDate', label: 'Сана', width: 110 },
  { key: 'itemCode', label: 'Код' },
  { key: 'itemName', label: 'Маҳсулот' },
  { key: 'warehouse', label: 'Склад коди' },
  { key: 'whsName', label: 'Склад номи' },
  { key: 'plannedQty', label: 'Режа (кг)', right: true, render: v => fmtFull(v) },
  { key: 'cmpltQty', label: 'Бажарилди (кг)', right: true, render: (v, row) => {
    const planned = parseFloat(row.plannedQty || 0);
    const done = parseFloat(v || 0);
    const pct = planned > 0 ? (done / planned * 100) : 0;
    return (
      <span style={{ color: pct >= 100 ? '#059669' : pct >= 80 ? '#D97706' : '#DC2626', fontWeight: 600 }}>
        {fmtFull(done)} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
      </span>
    );
  }},
];

export default function MillProduction({ fetcher = dash.millProduction }) {
  return (
    <DataPage
      queryKey="mill-production"
      fetcher={fetcher}
      title="Тегирмон ишлаб чиқариши"
      subtitle="Режа ва факт солиштириш"
      columns={COLS}
      topContent={(rows) => rows.length === 0 ? null : (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 12 }}>Режа vs Факт</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={rows.map(r => ({
                date: `${r.docDate?.slice(5)} ${r.itemName?.slice(0,8)}`,
                Режа: parseFloat(r.plannedQty || 0),
                Факт: parseFloat(r.cmpltQty || 0),
              }))}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} width={55} />
              <Tooltip formatter={(v) => [v.toLocaleString('ru-RU') + ' кг']} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Режа" fill="#CBD5E1" radius={[3,3,0,0]} />
              <Bar dataKey="Факт" fill="#1B3A8C" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    />
  );
}
