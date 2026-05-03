import DataPage from '../../components/ui/DataPage';
import { dashJbi } from '../../services/apiJbi';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'bsuName', label: 'БСУ номи' },
  { key: 'composition', label: 'Таркиб' },
  { key: 'mark', label: 'Марка' },
  { key: 'day3', label: '3-кун', right: true },
  { key: 'day14', label: '14-кун', right: true },
  { key: 'day28', label: '28-кун', right: true },
  { key: 'megaPascal', label: 'МПа', right: true },
  { key: 'moisture', label: 'Влага', right: true },
  { key: 'basedMark', label: 'Асосланган маркаси' },
  { key: 'pct', label: 'Фоиз %', right: true },
  { key: 'destination', label: 'Қаерга' },
];

export default function JbiLab() {
  return (
    <DataPage
      queryKey="jbi-lab"
      fetcher={dashJbi.defectDetails}
      title="ЖБ — Лаборатория хисоботи"
      columns={COLUMNS}
    />
  );
}
