import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'itemCode', label: 'Код' },
  { key: 'itemName', label: 'Маҳсулот номи' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'onHand', label: 'Қолдиқ', right: true },
  { key: 'committed', label: 'Банд қилинган', right: true },
  { key: 'ordered', label: 'Буюртма', right: true },
  { key: 'available', label: 'Мавжуд', right: true },
  { key: 'uom', label: 'Ўлчов' },
  { key: 'avgCost', label: 'Ўрт. нарх', right: true },
  { key: 'totalValue', label: 'Жами қиймат', right: true },
];

export default function CementWarehouse() {
  return (
    <ReportPage
      db="cement"
      reportKey="warehouse"
      title="Склад қолдиқлари — Цемент"
      columns={COLUMNS}
    />
  );
}
