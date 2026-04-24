import ReportPage from '../../components/ui/ReportPage';

const COLUMNS = [
  { key: 'date', label: 'Сана' },
  { key: 'account', label: 'Хисоб рақами' },
  { key: 'accountName', label: 'Харажат тури' },
  { key: 'costCenter', label: 'Харажат маркази' },
  { key: 'description', label: 'Изох' },
  { key: 'debit', label: 'Дебет', right: true },
  { key: 'credit', label: 'Кредит', right: true },
  { key: 'currency', label: 'Валюта' },
];

export default function Expenses() {
  return (
    <ReportPage
      db="common"
      reportKey="expenses"
      title="Харажатлар хисоботи"
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
