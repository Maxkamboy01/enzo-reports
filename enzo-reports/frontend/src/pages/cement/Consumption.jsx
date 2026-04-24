import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'itemName', label: 'Хом ашё номи' },
  { key: 'remainStart', label: 'Қолдиқ (бош)', right: true },
  { key: 'incoming', label: 'Кирим', right: true },
  { key: 'consumed', label: 'Сарф', right: true },
  { key: 'remainEnd', label: 'Қолдиқ (охир)', right: true },
];

export default function CementConsumption() {
  return (
    <ReportPage
      db="cement"
      reportKey="consumption"
      title="Цемент сарфи — Кунлик хисоб"
      columns={COLUMNS}
    />
  );
}
