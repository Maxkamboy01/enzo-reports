import DataPage from '../components/ui/DataPage';
import { dash, fmtFull, fmtN } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';

const COLS = [
  { key: 'docDate',    label: 'Сана',      width: 110 },
  { key: 'shift',      label: 'Смена',     width: 80 },
  { key: 'itemCode',   label: 'Код' },
  { key: 'itemName',   label: 'Маҳсулот' },
  { key: 'quantity',   label: 'Ҳажм (т)',  right: true, render: v => fmtN(v) },
  { key: 'uom',        label: 'Бирлик',    width: 70 },
  { key: 'warehouse',  label: 'Склад' },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const d = r.docDate?.slice(5, 10) ?? r.docDate ?? '—';
    grouped[d] = (grouped[d] || 0) + (parseFloat(r.quantity) || 0);
  });
  const data = Object.entries(grouped).map(([date, qty]) => ({ date, qty }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>
        Кунлик ишлаб чиқариш ҳажми
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <Tooltip formatter={v => [fmtFull(v) + ' т']} />
          <Bar dataKey="qty" name="Ҳажм" fill="#1B3A8C" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VolumeDaily({ fetcher = dash.volumeDaily }) {
  return (
    <DataPage
      queryKey="volume-daily"
      fetcher={fetcher}
      title="Кунлик ишлаб чиқариш ҳажми"
      subtitle="Volume Daily — ишлаб чиқариш бўйича кунлик маълумот"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
