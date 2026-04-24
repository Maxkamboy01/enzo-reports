import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'itemCode', label: 'Код' },
  { key: 'itemName', label: 'Номи' },
  { key: 'quantity', label: 'Миқдор', right: true },
  { key: 'uom', label: 'Ўлчов' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'cost', label: 'Нарх', right: true },
  { key: 'total', label: 'Жами', right: true },
];

export default function CementRawMaterials() {
  return (
    <ReportPage
      db="cement"
      reportKey="rawmaterials"
      title="Умумий хом ашё сарфи — Цемент"
      columns={COLUMNS}
    />
  );
}
