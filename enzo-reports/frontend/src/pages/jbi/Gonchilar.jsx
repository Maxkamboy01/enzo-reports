import DataPage from '../../components/ui/DataPage';
import { dashJbi } from '../../services/apiJbi';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'shift', label: 'Смена' },
  { key: 'itemName', label: 'Хом ашё номи' },
  { key: 'remainStart', label: 'Қолдиқ (бош)', right: true },
  { key: 'incoming', label: 'Кирим', right: true },
  { key: 'consumed', label: 'Сарф', right: true },
  { key: 'remainEnd', label: 'Қолдиқ (охир)', right: true },
  { key: 'uom', label: 'Ўлчов' },
];

export default function JbiGonchilar() {
  return (
    <DataPage
      queryKey="jbi-gonchilar"
      fetcher={dashJbi.materialConsumptionShift}
      title="Гончилар участкаси — Цемент хом ашёси сарфи"
      columns={COLUMNS}
    />
  );
}
