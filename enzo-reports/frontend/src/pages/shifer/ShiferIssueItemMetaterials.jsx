import DataPage from '../../components/ui/DataPage';
import { dashShifer } from '../../services/apiShifer';
import { fmtN, fmtFull } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const COLORS = ['#059669','#D97706','#1B3A8C','#7C3AED','#DC2626','#0891B2','#64748B'];

const COLS = [
  { key: 'docDate',     label: 'Сана',           width: 110 },
  { key: 'itemCode',    label: 'Материал коди' },
  { key: 'itemName',    label: 'Материал номи' },
  { key: 'quantity',    label: 'Миқдор',          right: true, render: v => fmtN(v) },
  { key: 'uom',         label: 'Бирлик',          width: 70 },
  { key: 'warehouse',   label: 'Склад' },
  { key: 'baseRef',     label: 'Асос ҳужжат' },
  { key: 'totalAmount', label: 'Жами сумма',      right: true, render: v => v != null ? fmtFull(v) : '—' },
];

function Chart({ rows }) {
  if (!rows.length) return null;
  const grouped = {};
  rows.forEach(r => {
    const k = r.itemName || r.itemCode || '—';
    grouped[k] = (grouped[k] || 0) + (parseFloat(r.quantity) || 0);
  });
  const data = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, qty]) => ({ name: name.slice(0, 20), qty }));
  return (
    <div>
      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--grey-800)', marginBottom: 10 }}>
        Материал чиқими (миқдор бўйича топ-12)
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={145} />
          <Tooltip formatter={v => [fmtN(v)]} />
          <Bar dataKey="qty" name="Миқдор" radius={[0,3,3,0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function NoTokenBanner() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FEF3C7', border:'1px solid #FDE68A',
      borderRadius:8, padding:'12px 16px', margin:'0 0 16px', fontSize:'.82rem', color:'#92400E' }}>
      <AlertCircle size={16} />
      Шифер базаси токени уланмаган. Сайдбар тагидаги <strong>Базалар</strong> тугмасини босинг.
    </div>
  );
}

export default function ShiferIssueItemMetaterials() {
  const { dbTokens } = useAuth();
  return (
    <DataPage
      queryKey="shifer-issue-materials"
      fetcher={dashShifer.issueItemMetaterials}
      title="Шифер — Материал чиқими"
      subtitle="Issue Item Metaterials · backend-greymix.bis-apps.com"
      columns={COLS}
      topContent={(rows) => (
        <>
          {!dbTokens.shifer && <NoTokenBanner />}
          <Chart rows={rows} />
        </>
      )}
    />
  );
}
