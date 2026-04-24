import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'docDate', label: 'Сана' },
  { key: 'docNum', label: 'Инвойс №' },
  { key: 'customer', label: 'Харидор' },
  { key: 'agent', label: 'Агент' },
  { key: 'itemName', label: 'Маҳсулот' },
  { key: 'quantity', label: 'Миқдор', right: true },
  { key: 'uom', label: 'Ўлчов' },
  { key: 'price', label: 'Нарх', right: true },
  { key: 'total', label: 'Жами', right: true },
  { key: 'currency', label: 'Валюта' },
];

export default function JbiSales() {
  return (
    <ReportPage db="jbi" reportKey="sales" title="Сотув хисоботи — ЖБИ" columns={COLUMNS} />
  );
}
