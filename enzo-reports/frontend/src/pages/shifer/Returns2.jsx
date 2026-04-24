import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'docNum', label: 'Хужжат №' },
  { key: 'customer', label: 'Харидор' },
  { key: 'itemName', label: 'Маҳсулот' },
  { key: 'quantity', label: 'Миқдор', right: true },
  { key: 'reason', label: 'Сабаб' },
  { key: 'total', label: 'Жами', right: true },
];

export default function ShiferReturns2() {
  return (
    <ReportPage
      db="shifer"
      reportKey="returns2"
      title="Возврадлар хисоби — 2-цех"
      columns={COLUMNS}
    />
  );
}
