import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import {
  Factory, TrendingUp, Package, Landmark, UserMinus, UserPlus,
  Receipt, ArrowLeftRight, BarChart2, Layers, LogOut, ChevronRight, Settings,
} from 'lucide-react';
import styles from './ModulesHub.module.css';

const MODULES = [
  {
    id: 'production',
    icons: Factory,
    color: '#1B3A8C',
    titles:    { uz: 'Ishlab chiqarish', ru: 'Производство', en: 'Production' },
    descs:     { uz: 'Tegirmon, xom-ashyo va sement', ru: 'Мельница, сырьё, цемент', en: 'Mill, raw materials, cement' },
    subLabels: { uz: 'Ishlab chiqarish hisobotlari', ru: 'Отчёты производства', en: 'Production reports' },
    isProduction: true,
  },
  {
    id: 'sales',
    icons: TrendingUp,
    color: '#059669',
    titles:    { uz: 'Sotuvlar', ru: 'Продажи', en: 'Sales' },
    descs:     { uz: "Menejerlar bo'yicha savdo hisoboti", ru: 'Отчёт менеджеров по продажам', en: 'Sales report by managers' },
    subLabels: { uz: 'Sotuvlar hisoboti', ru: 'Заказов на продажу', en: 'Sales orders' },
    route: '/sales',
  },
  {
    id: 'warehouse',
    icons: Package,
    color: '#D97706',
    titles:    { uz: 'Ombor', ru: 'Склад', en: 'Warehouse' },
    descs:     { uz: "Tovarlar qoldig'ini boshqarish", ru: 'Управление запасами и складом', en: 'Inventory & stock management' },
    subLabels: { uz: "Ombordagi tovarlar", ru: 'Товаров на складе', en: 'Items in stock' },
    route: '/warehouse',
  },
  {
    id: 'accounts',
    icons: Landmark,
    color: '#0891B2',
    titles:    { uz: 'Hisob-raqamlar', ru: 'Счета', en: 'Accounts' },
    descs:     { uz: 'Kassa va bank hisobvaraqlari', ru: 'Кассы и расчётные счета', en: 'Cash & bank accounts' },
    subLabels: { uz: "Umumiy balans", ru: 'Общий баланс', en: 'Total balance' },
    route: '/accounts',
  },
  {
    id: 'debtors',
    icons: UserMinus,
    color: '#DC2626',
    titles:    { uz: 'Debitorlar', ru: 'Дебиторы', en: 'Debtors' },
    descs:     { uz: "Xaridorlar qarzdorligi", ru: 'Задолженность покупателей', en: 'Customer receivables' },
    subLabels: { uz: "Jami debitorlik", ru: 'Общая задолженность', en: 'Total receivables' },
    route: '/debtors',
  },
  {
    id: 'creditors',
    icons: UserPlus,
    color: '#7C3AED',
    titles:    { uz: 'Kreditorlar', ru: 'Кредиторы', en: 'Creditors' },
    descs:     { uz: "Ta'minotchilar qarzdorligi", ru: 'Задолженность поставщикам', en: 'Supplier payables' },
    subLabels: { uz: "Jami kreditorlik", ru: 'Общая задолженность', en: 'Total payables' },
    route: '/creditors',
  },
  {
    id: 'expenses',
    icons: Receipt,
    color: '#64748B',
    titles:    { uz: 'Xarajatlar', ru: 'Расходы', en: 'Expenses' },
    descs:     { uz: "94xx hisoblar bo'yicha xarajatlar", ru: 'Транзакции по счетам 94xx', en: 'Expenses (accounts 94xx)' },
    subLabels: { uz: "Oylik xarajatlar", ru: 'Месячные расходы', en: 'Monthly expenses' },
    route: '/expenses',
  },
  {
    id: 'cashflow',
    icons: ArrowLeftRight,
    color: '#0D9488',
    titles:    { uz: 'Pul oqimlari', ru: 'Ден. потоки', en: 'Cash Flow' },
    descs:     { uz: "Kirim va chiqim to'lovlar", ru: 'Входящие и исходящие платежи', en: 'Incoming & outgoing payments' },
    subLabels: { uz: "To'lovlar harakati", ru: 'Движение платежей', en: 'Payment flow' },
    route: '/cashflow',
  },
  {
    id: 'pnl',
    icons: BarChart2,
    color: '#F59E0B',
    titles:    { uz: "P&L hisobot", ru: 'P&L отчёт', en: 'P&L Report' },
    descs:     { uz: 'Foyda va zarar hisoboti', ru: 'Доходы, расходы, результат', en: 'Profit & loss report' },
    subLabels: { uz: "Moliyaviy natija", ru: 'Финансовый результат', en: 'Financial result' },
    route: '/pnl',
  },
  {
    id: 'product-cost',
    icons: Layers,
    color: '#0D9488',
    titles:    { uz: 'Mahsulot tannarxi', ru: 'Себестоимость', en: 'Product Cost' },
    descs:     { uz: "Komponentlar bo'yicha xarajat tuzilmasi", ru: 'Структура себестоимости продукта', en: 'Product cost structure by component' },
    subLabels: { uz: "Birlik narxi · %", ru: 'Себест. на ед. · %', en: 'Cost per unit · %' },
    route: '/product-cost',
  },
];

export default function ModulesHub() {
  const navigate = useNavigate();
  const { user, logout, dbTokens } = useAuth();
  const { lang } = useI18n();
  const l = ['uz','ru','en'].includes(lang) ? lang : 'uz';

  const getProductionRoute = () => {
    const lsHas = k => !!localStorage.getItem(k);
    if (dbTokens.cement || lsHas('enzo_token')) return '/mill-production';
    if (dbTokens.shifer || lsHas('enzo_token_shifer')) return '/shifer/production-performance';
    if (dbTokens.jbi    || lsHas('enzo_token_jbi'))    return '/jbi/mill-production';
    return '/mill-production';
  };

  const handleCard = (mod) => {
    navigate(mod.isProduction ? getProductionRoute() : mod.route);
  };

  const initials = (name) => (name || 'A')[0].toUpperCase();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>E</div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>ENZO</div>
            <div className={styles.brandTag}>Analytics Portal</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to="/settings" className={styles.settingsBtn} title="Settings">
            <Settings size={16} />
          </Link>
          <div className={styles.userPill}>
            <div className={styles.avatar}>{initials(user?.name)}</div>
            <span className={styles.userName}>{user?.name || 'Admin'}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeBlock}>
          <h1 className={styles.welcomeTitle}>
            {{ uz: 'Xush kelibsiz', ru: 'Добро пожаловать', en: 'Welcome' }[l]}
          </h1>
          <p className={styles.welcomeSub}>
            {{ uz: 'Modulni tanlang va ishlashni boshlang', ru: 'Выберите модуль для работы', en: 'Select a module to get started' }[l]}
          </p>
        </div>

        <div className={styles.grid}>
          {MODULES.map(mod => {
            const Icon = mod.icons;
            return (
              <button key={mod.id} className={styles.card} onClick={() => handleCard(mod)}>
                <div className={styles.cardContent}>
                  <div className={styles.cardRow1}>
                    <div className={styles.iconWrap} style={{ background: mod.color + '20', color: mod.color }}>
                      <Icon size={22} />
                    </div>
                    <span className={styles.cardStat}>—</span>
                  </div>
                  <div className={styles.cardTitle}>{mod.titles[l]}</div>
                  <div className={styles.cardDesc}>{mod.descs[l]}</div>
                  <div className={styles.cardSubLabel}>{mod.subLabels[l]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
