import DataPage from '../components/ui/DataPage';
import { dash, fmtFull } from '../services/api';

const COLS = [
  { key: 'docDate', label: 'Сана', width: 110 },
  { key: 'itemCode', label: 'Код' },
  { key: 'itemName', label: 'Номи' },
  { key: 'incoming', label: 'Кириш (кг)', right: true, render: v => {
    const n = parseFloat(v || 0);
    return n > 0 ? <span style={{ color: '#059669', fontWeight: 600 }}>+{fmtFull(n)}</span> : '—';
  }},
  { key: 'сonsumption', label: 'Сарф (кг)', right: true, render: v => {
    const n = parseFloat(v || 0);
    return n > 0 ? <span style={{ color: '#DC2626', fontWeight: 600 }}>-{fmtFull(n)}</span> : '—';
  }},
  { key: 'difference', label: 'Фарқ (кг)', right: true, render: v => {
    const n = parseFloat(v || 0);
    return <span style={{ color: n >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>{n >= 0 ? '+' : ''}{fmtFull(n)}</span>;
  }},
];

export default function RawMaterialMovement({ fetcher = dash.rawMaterialMovement, queryKey = 'raw-material-movement' }) {
  return (
    <DataPage
      queryKey={queryKey}
      fetcher={fetcher}
      title="Хом ашё ҳаракати"
      subtitle="Кириш ва чиқиш ёзувлари"
      columns={COLS}
    />
  );
}
