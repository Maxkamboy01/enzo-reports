import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'shiferStart', label: 'Шифер кун боши', right: true },
  { key: 'shiferEnd', label: 'Шифер кун охири', right: true },
  { key: 'shiferKwt', label: 'Шифер КвТ', right: true },
  { key: 'shiferSum', label: 'Шифер Сумма', right: true },
  { key: 'millStart', label: 'Тегирмон кун боши', right: true },
  { key: 'millEnd', label: 'Тегирмон кун охири', right: true },
  { key: 'millKwt', label: 'Тегирмон КвТ', right: true },
  { key: 'millSum', label: 'Тегирмон Сумма', right: true },
  { key: 'jbiStart', label: 'ЖБ кун боши', right: true },
  { key: 'jbiEnd', label: 'ЖБ кун охири', right: true },
  { key: 'jbiKwt', label: 'ЖБ КвТ', right: true },
  { key: 'jbiSum', label: 'ЖБ Сумма', right: true },
];

export default function ShiferEnergy() {
  return (
    <ReportPage
      db="shifer"
      reportKey="energy"
      title="Энергетика бўлими — Кунлик истеъмол"
      columns={COLUMNS}
    />
  );
}
