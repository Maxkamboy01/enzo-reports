import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'docDate', label: 'Сана' },
  { key: 'docNum', label: 'Инвойс №' },
  { key: 'customer', label: 'Харидор' },
  { key: 'agent', label: 'Агент' },
  { key: 'quantity', label: 'Миқдор (дона)', right: true },
  { key: 'price', label: 'Нарх', right: true },
  { key: 'total', label: 'Жами', right: true },
  { key: 'currency', label: 'Валюта' },
  { key: 'status', label: 'Ҳолат' },
];

export default function ShiferSales() {
  return (
    <ReportPage
      db="shifer"
      reportKey="sales"
      title="Шифер сотуви — Асосий хисобот"
      columns={COLUMNS}
      renderFilters={(filters, setFilters) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>Агент:</label>
          <input
            style={{ padding: '6px 10px', border: '1px solid var(--grey-300)', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }}
            placeholder="Агент номи"
            value={filters.agent || ''}
            onChange={e => setFilters(f => ({ ...f, agent: e.target.value }))}
          />
        </div>
      )}
    />
  );
}
