import DataPage from '../../components/ui/DataPage';
import { dashJbi } from '../../services/apiJbi';

const COLUMNS = [
  { key: 'customer', label: 'Харидор' },
  { key: 'docNum', label: 'Хужжат №' },
  { key: 'docDate', label: 'Сана' },
  { key: 'dueDate', label: 'Тўлов муддати' },
  { key: 'total', label: 'Жами', right: true },
  { key: 'paid', label: 'Тўланди', right: true },
  { key: 'balance', label: 'Қолдиқ', right: true },
  { key: 'overdueDays', label: 'Кечикиш (кун)', right: true,
    render: val => <span style={{ color: val > 0 ? 'var(--danger)' : 'inherit', fontWeight: val > 0 ? 600 : 400 }}>{val ?? '—'}</span>
  },
];

export default function JbiAR() {
  return (
    <DataPage
      queryKey="jbi-ar"
      fetcher={dashJbi.ar}
      title="Дебиторлар — ЖБИ"
      columns={COLUMNS}
    />
  );
}
