import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'magulevMark', label: 'Магулёв ЛФМ маркаси', right: true },
  { key: 'chinaLineMark', label: 'Хитой Линия маркаси', right: true },
  { key: 'salesMark', label: 'Сотув маркаси', right: true },
  { key: 'magulevCao', label: 'Магулёв СаО', right: true },
  { key: 'chinaLineCao', label: 'Хитой Линия СаО', right: true },
  { key: 'cementMoisture', label: 'Шифер линия цемент памоли', right: true },
  { key: 'klinkerMark', label: 'Клинкер маркаси', right: true },
];

export default function CementLab() {
  return (
    <ReportPage
      db="cement"
      reportKey="lab"
      title="Лаборатория бўлими — Цемент"
      columns={COLUMNS}
    />
  );
}
