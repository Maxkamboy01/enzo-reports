import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'remainStart', label: 'Қолдиқ (бош)', right: true },
  { key: 'production', label: 'Ишлаб чиқариш', right: true },
  { key: 'sales', label: 'Сотув', right: true },
  { key: 'returns', label: 'Возврад', right: true },
  { key: 'remainEnd', label: 'Қолдиқ (охир)', right: true },
];

export default function ShiferAccounting() {
  return (
    <ReportPage
      db="shifer"
      reportKey="accounting"
      title="Умумий шифер хисоби — Асосий"
      columns={COLUMNS}
    />
  );
}
