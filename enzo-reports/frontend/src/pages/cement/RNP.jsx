import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'department', label: 'Бўлим' },
  { key: 'indicator', label: 'Кўрсаткич' },
  { key: 'responsible', label: 'Жавобгар' },
  { key: 'planPct', label: 'Режа %', right: true },
  { key: 'planVal', label: 'Режа кўр.', right: true },
  { key: 'factPct', label: 'Факт %', right: true },
  { key: 'factVal', label: 'Факт кўр.', right: true },
  { key: 'total', label: 'Жами', right: true },
];

export default function CementRNP() {
  return (
    <ReportPage
      db="cement"
      reportKey="rnp"
      title="РНП — Режа ва Натижа Протокол (Цемент)"
      columns={COLUMNS}
    />
  );
}
