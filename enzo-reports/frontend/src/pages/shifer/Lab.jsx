import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'magulevMark', label: 'Магулёв ЛФМ маркаси', right: true },
  { key: 'chinaLineMark', label: 'Хитой Линия маркаси', right: true },
  { key: 'salesMark', label: 'Сотув маркаси', right: true },
  { key: 'magulevCao', label: 'Магулёв СаО', right: true },
  { key: 'chinaLineCao', label: 'Хитой Линия СаО', right: true },
  { key: 'shiferCementMoisture', label: 'Шифер цемент памоли', right: true },
  { key: 'salesMoisture', label: 'Сотув памоли', right: true },
];

export default function ShiferLab() {
  return (
    <ReportPage
      db="shifer"
      reportKey="lab"
      title="Лаборатория бўлими — Шифер"
      columns={COLUMNS}
    />
  );
}
