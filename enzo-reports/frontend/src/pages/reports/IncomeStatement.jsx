import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'account', label: 'Хисоб рақами' },
  { key: 'accountName', label: 'Номи' },
  { key: 'opening', label: 'Давр бошида', right: true },
  { key: 'debit', label: 'Дебет айланма', right: true },
  { key: 'credit', label: 'Кредит айланма', right: true },
  { key: 'closing', label: 'Давр охирида', right: true },
  { key: 'currency', label: 'Валюта' },
];

export default function IncomeStatement() {
  return (
    <ReportPage
      db="common"
      reportKey="income-statement"
      title="Молиявий натижа — Фойда ва Зарар"
      columns={COLUMNS}
      renderFilters={(filters, setFilters) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>
            База:
          </label>
          <select
            style={{ padding: '6px 10px', border: '1px solid var(--grey-300)', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }}
            value={filters.db || 'all'}
            onChange={e => setFilters(f => ({ ...f, db: e.target.value }))}
          >
            <option value="all">Барча базалар</option>
            <option value="cement">Цемент</option>
            <option value="shifer">Шифер</option>
            <option value="jbi">ЖБИ</option>
          </select>
        </div>
      )}
    />
  );
}
