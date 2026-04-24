import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'remainStart', label: 'Бункер қолдиғи (бош)', right: true },
  { key: 'production', label: 'Ишлаб чиқариш', right: true },
  { key: 'sales', label: 'Сотув тарози', right: true },
  { key: 'remainEnd', label: 'Бункер қолдиғи (охир)', right: true },
];

export default function CementMill() {
  return (
    <ReportPage
      db="cement"
      reportKey="mill"
      title="Тегирмон участкаси — Кунлик кўрсаткичлар"
      columns={COLUMNS}
    />
  );
}
