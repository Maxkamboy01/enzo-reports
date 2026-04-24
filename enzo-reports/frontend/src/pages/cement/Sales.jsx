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
  { key: 'discountPct', label: 'Чегирма %', right: true },
  { key: 'total', label: 'Жами', right: true },
  { key: 'currency', label: 'Валюта' },
  { key: 'status', label: 'Ҳолат' },
];

export default function CementSales() {
  return (
    <ReportPage
      db="cement"
      reportKey="sales"
      title="Сотув хисоботи — Цемент"
      columns={COLUMNS}
      renderFilters={(filters, setFilters) => (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>
              Агент:
            </label>
            <input
              style={{ padding: '6px 10px', border: '1px solid var(--grey-300)', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }}
              placeholder="Агент номи"
              value={filters.agent || ''}
              onChange={e => setFilters(f => ({ ...f, agent: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>
              Харидор:
            </label>
            <input
              style={{ padding: '6px 10px', border: '1px solid var(--grey-300)', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }}
              placeholder="Харидор номи"
              value={filters.customer || ''}
              onChange={e => setFilters(f => ({ ...f, customer: e.target.value }))}
            />
          </div>
        </>
      )}
    />
  );
}
