import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';

const SHIFT_COLORS = { '1': '#1B3A8C', '2': '#D97706', '3': '#059669', Night: '#7C3AED', Day: '#D97706' };

const COLS = [
  { key: 'docDate',   label: 'Сана',        width: 110 },
  { key: 'shift',     label: 'Смена',       width: 80 },
  { key: 'itemCode',  label: 'Код' },
  { key: 'itemName',  label: 'Материал' },
  { key: 'quantity',  label: 'Сарф (кг)',   right: true, render: v => fmtN(v) },
  { key: 'uom',       label: 'Бирлик',      width: 70 },
  { key: 'warehouse', label: 'Склад' },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const shiftTotals = {};
  rows.forEach(r => {
    const s = String(r.shift || 'N/A');
    shiftTotals[s] = (shiftTotals[s] || 0) + (parseFloat(r.quantity) || 0);
  });
  const data = Object.entries(shiftTotals).map(([shift, qty]) => ({ shift: `Смена ${shift}`, qty }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Смена бўйича умумий сарф</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="shift" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={65} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <Tooltip formatter={v => [fmtFull(v) + ' кг']} />
          <Bar dataKey="qty" name="Сарф" fill="#1B3A8C" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MaterialConsumptionShift() {
  return (
    <DataPage
      queryKey="material-consumption-shift"
      fetcher={dash.materialConsumptionShift}
      title="Смена бўйича материал сарфи"
      subtitle="Material Consumption Shift — сменалар кесимида сарф таҳлили"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
