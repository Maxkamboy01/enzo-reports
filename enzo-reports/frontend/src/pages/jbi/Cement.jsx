import DataPage from '../../components/ui/DataPage';
import { dashJbi } from '../../services/apiJbi';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'bsu1Remain', label: 'БСУ-1 Қолдиқ', right: true },
  { key: 'bsu1Incoming', label: 'БСУ-1 Кирим', right: true },
  { key: 'bsu1Consumed', label: 'БСУ-1 Сарф', right: true },
  { key: 'bsu2Remain', label: 'БСУ-2 Қолдиқ', right: true },
  { key: 'bsu2Incoming', label: 'БСУ-2 Кирим', right: true },
  { key: 'bsu2Consumed', label: 'БСУ-2 Сарф', right: true },
  { key: 'bsu3Remain', label: 'БСУ-3 Қолдиқ', right: true },
  { key: 'bsu3Incoming', label: 'БСУ-3 Кирим', right: true },
  { key: 'bsu3Consumed', label: 'БСУ-3 Сарф', right: true },
  { key: 'totalRemain', label: 'Жами қолдиқ', right: true },
];

export default function JbiCement() {
  return (
    <DataPage
      queryKey="jbi-cement"
      fetcher={dashJbi.cementConsumption}
      title="Темир-бетон цемент сарфи — БСУ бункерлари"
      columns={COLUMNS}
    />
  );
}
