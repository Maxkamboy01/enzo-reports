import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';

const COLS = [
  { key: 'docDate', label: 'Сана', width: 110 },
  { key: 'itemCode', label: 'Маҳсулот коди' },
  { key: 'itemName', label: 'Маҳсулот номи' },
  { key: 'quantity', label: 'Миқдор (кг)', right: true, render: v => fmtFull(v) },
  { key: 'warehouse', label: 'Склад' },
];

export default function CementConsumption({ fetcher = dash.cementConsumption, queryKey = 'cement-consumption' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Цемент сарфи"
      subtitle="Тайёр цемент сарфи хисоботи"
      columns={COLS}
    />
  );
}
