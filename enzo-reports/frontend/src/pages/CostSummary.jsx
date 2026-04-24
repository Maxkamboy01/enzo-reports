import DataPage from '../components/ui/DataPage';
import { dash, fmtN, fmtFull } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const COLS = [
  { key: 'docDate',        label: 'Сана',         width: 110 },
  { key: 'category',       label: 'Тури' },
  { key: 'itemName',       label: 'Номланиши' },
  { key: 'totalAmount',    label: 'Жами (сўм)',    right: true, render: v => fmtFull(v) },
  { key: 'costPerTon',     label: 'Тонна нархи',  right: true, render: v => v != null ? fmtFull(v) + ' сўм/т' : '—' },
  { key: 'production',     label: 'Ишлаб чиқариш (т)', right: true, render: v => fmtN(v) },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const data = rows.slice(0, 20).map(r => ({
    label: r.docDate?.slice(5, 10) || r.category || '—',
    Жами: parseFloat(r.totalAmount) || 0,
  }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>Харажат жами динамикаси</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
          <Tooltip formatter={v => [fmtFull(v) + ' сўм']} />
          <Bar dataKey="Жами" fill="#1B3A8C" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CostSummary() {
  return (
    <DataPage
      queryKey="cost-summary"
      fetcher={dash.costSummary}
      title="Харажат хулосаси"
      subtitle="Cost Summary — жами харажатлар якуний кўриниши"
      columns={COLS}
      topContent={(rows) => <Chart rows={rows} />}
    />
  );
}
