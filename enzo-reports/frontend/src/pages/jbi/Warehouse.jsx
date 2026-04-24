import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'itemCode', label: 'Код' },
  { key: 'itemName', label: 'Маҳсулот номи' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'onHand', label: 'Қолдиқ', right: true },
  { key: 'committed', label: 'Банд', right: true },
  { key: 'available', label: 'Мавжуд', right: true },
  { key: 'uom', label: 'Ўлчов' },
  { key: 'avgCost', label: 'Ўрт. нарх', right: true },
  { key: 'totalValue', label: 'Жами қиймат', right: true },
];

export default function JbiWarehouse() {
  return <ReportPage db="jbi" reportKey="warehouse" title="Склад қолдиқлари — ЖБИ" columns={COLUMNS} />;
}
