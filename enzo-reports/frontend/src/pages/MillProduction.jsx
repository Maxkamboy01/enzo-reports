import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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

const tooltipStyle = {
  contentStyle: { borderRadius: 10, fontSize: 13, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px 14px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 6 },
  itemStyle: { color: '#374151' },
  cursor: { fill: 'rgba(27,58,140,0.04)' },
};

export default function MillProduction({ fetcher = dash.millProduction, queryKey = 'mill-production' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Тегирмон ишлаб чиқариши"
      subtitle="Режа ва факт солиштириш"
      columns={COLS}
      topContent={(rows) => rows.length === 0 ? null : (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 12 }}>Режа vs Факт</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={rows.slice(0, 40).map(r => ({
                date: r.docDate?.slice(5, 10) ?? '—',
                name: r.itemName ?? '',
                Режа: parseFloat(r.plannedQty || 0),
                Факт: parseFloat(r.cmpltQty || 0),
              }))}
              barCategoryGap="30%"
              margin={{ top: 8, right: 10, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, angle: -35, textAnchor: 'end', fill: '#6B7280' }}
                height={65}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} width={52} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v, name) => [v.toLocaleString('ru-RU') + ' кг', name]}
                labelFormatter={(label, payload) => {
                  const name = payload?.[0]?.payload?.name;
                  return name ? `${label} · ${name}` : label;
                }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
              <Bar dataKey="Режа" fill="#CBD5E1" radius={[3,3,0,0]} />
              <Bar dataKey="Факт" fill="#1B3A8C" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    />
  );
}
