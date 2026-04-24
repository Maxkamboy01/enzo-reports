import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';
import { ArrowRight } from 'lucide-react';

const COLS = [
  { key: 'docDate', label: 'Сана', width: 110 },
  { key: 'docNum', label: 'Хужжат №', width: 80 },
  { key: 'itemCode', label: 'Маҳсулот коди' },
  { key: 'itemName', label: 'Маҳсулот' },
  { key: 'fromWhsCod', label: 'Дан (склад)' },
  { key: 'whsCode', label: 'Га (склад)', render: (v, row) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <ArrowRight size={12} color="var(--grey-400)" />
      {v}
    </span>
  )},
  { key: 'quantity', label: 'Миқдор (кг)', right: true, render: v => fmtFull(v) },
];

export default function InventoryTransfer() {
  return (
    <DataPage
      queryKey="inventory-transfer"
      fetcher={dash.inventoryTransfer}
      title="Омбор ўтказмаси"
      subtitle="Складлар ўртасида ўтказмалар"
      columns={COLS}
    />
  );
}
