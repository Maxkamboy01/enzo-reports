import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'itemCode', label: 'Код' },
  { key: 'itemName', label: 'Маҳсулот номи' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'onHand', label: 'Қолдиқ (дона)', right: true },
  { key: 'committed', label: 'Банд', right: true },
  { key: 'available', label: 'Мавжуд', right: true },
  { key: 'avgCost', label: 'Ўрт. нарх', right: true },
  { key: 'totalValue', label: 'Жами қиймат', right: true },
];

export default function ShiferWarehouse() {
  return (
    <ReportPage db="shifer" reportKey="warehouse" title="Склад қолдиқлари — Шифер" columns={COLUMNS} />
  );
}
