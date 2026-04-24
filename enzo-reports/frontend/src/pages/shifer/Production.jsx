import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'production', label: 'Ишлаб чиқариш', right: true },
  { key: 'shopCount', label: 'Цехавой сони', right: true },
  { key: 'sales', label: 'Сотув', right: true },
  { key: 'returns', label: 'Возврад', right: true },
  { key: 'asbestSacks', label: 'Азбест қоп', right: true },
  { key: 'asbestConsumed', label: 'Азбест сарф (кг)', right: true },
];

export default function ShiferProduction() {
  return (
    <ReportPage
      db="shifer"
      reportKey="production"
      title="Шифер цехи — РНП кўрсаткичлари"
      columns={COLUMNS}
    />
  );
}
