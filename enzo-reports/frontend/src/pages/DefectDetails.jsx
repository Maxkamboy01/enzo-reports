import DataPage from '../components/ui/DataPage';
import { dash, fmtFull, fmtN } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const COLS = [
  { key: 'docDate',     label: 'Сана',          width: 110 },
  { key: 'itemCode',    label: 'Код' },
  { key: 'itemName',    label: 'Маҳсулот' },
  { key: 'defectType',  label: 'Нуқсон тури' },
  { key: 'quantity',    label: 'Миқдор (т)',     right: true, render: v => fmtN(v) },
  { key: 'reason',      label: 'Сабаб' },
  { key: 'warehouse',   label: 'Склад' },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const k = r.defectType || r.itemName || '—';
    grouped[k] = (grouped[k] || 0) + (parseFloat(r.quantity) || 0);
  });
  const data = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, qty]) => ({ name: name.slice(0, 20), qty }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Нуқсон тури бўйича миқдор</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmtFull(v)} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
          <Tooltip formatter={v => [fmtN(v) + ' т']} />
          <Bar dataKey="qty" name="Миқдор" fill="#DC2626" radius={[0,3,3,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DefectDetails({ fetcher = dash.defectDetails }) {
  return (
    <DataPage
      queryKey="defect-details"
      fetcher={fetcher}
      title="Нуқсон тафсилоти"
      subtitle="Defect Details — сифат назорати ва нуқсонлар таҳлили"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
