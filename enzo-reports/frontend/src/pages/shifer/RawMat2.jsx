import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'itemName', label: 'Хом ашё номи' },
  { key: 'remainStart', label: 'Қолдиқ (бош)', right: true },
  { key: 'incoming', label: 'Кирим', right: true },
  { key: 'consumed', label: 'Сарф', right: true },
  { key: 'remainEnd', label: 'Қолдиқ (охир)', right: true },
  { key: 'uom', label: 'Ўлчов' },
];

export default function ShiferRawMat2() {
  return (
    <ReportPage
      db="shifer"
      reportKey="rawmat2"
      title="Хом ашёлар хисоби — 2-га"
      columns={COLUMNS}
    />
  );
}
