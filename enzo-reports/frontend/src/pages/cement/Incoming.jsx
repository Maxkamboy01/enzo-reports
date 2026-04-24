import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'docNum', label: 'Хужжат №' },
  { key: 'supplier', label: 'Таминотчи' },
  { key: 'itemName', label: 'Хом ашё номи' },
  { key: 'quantity', label: 'Миқдор', right: true },
  { key: 'uom', label: 'Ўлчов' },
  { key: 'price', label: 'Нарх', right: true },
  { key: 'total', label: 'Жами сумма', right: true },
  { key: 'warehouse', label: 'Склад' },
];

export default function CementIncoming() {
  return (
    <ReportPage
      db="cement"
      reportKey="incoming"
      title="Олиб келинган хом ашё — Цемент"
      columns={COLUMNS}
    />
  );
}
