import { createContext, useContext, useState } from 'react';

const LANGS = {
  uz: {
    'nav.production':'Ишлаб чиқариш','nav.rawmat':'Хом ашё','nav.silo':'Силос & Цемент',
    'nav.clinker':'Клинкер','nav.quality':'Сифат назорати','nav.cost':'Харажатлар',
    'nav.inventory':'Омбор','nav.shifer_overview':'Шифер · Умумий',
    'nav.shifer_production':'Шифер · Ишлаб чиқариш','nav.shifer_rawmat':'Шифер · Хом ашё',
    'nav.jbi_production':'ЖБИ · Ишлаб чиқариш','nav.jbi_rawmat':'ЖБИ · Хом ашё',
    'nav.jbi_silo':'ЖБИ · Силос & Цемент','nav.jbi_cement':'ЖБИ · Цемент',
    'nav.jbi_quality':'ЖБИ · Сифат',
    'nav.jbi_cost':'ЖБИ · Харажатлар','nav.jbi_inventory':'ЖБИ · Омбор',

    'item.dashboard':'Асосий панель','item.mill_production':'Тегирмон ишлаб чиқариши',
    'item.volume_daily':'Кунлик ҳажм','item.shift_performance':'Смена кўрсаткичлари',
    'item.raw_materials_stock':'Қолдиқлар','item.raw_material_receipt':'Кириш',
    'item.raw_material_consumption':'Сарф','item.raw_material_movement':'Ҳаракат',
    'item.raw_material_pivot':'Пивот жадвал','item.material_vs_bom':'vs BOM',
    'item.material_overconsumption':'Ортиқча сарф','item.material_consumption_shift':'Смена бўйича сарф',
    'item.silo_stock':'Силос қолдиқлари','item.cement_consumption':'Цемент сарфи',
    'item.cement_additive':'Қўшимчалар таркиби','item.clinker_factor':'Клинкер омил',
    'item.clinker_trend':'Омил тренди','item.defect_details':'Нуқсон тафсилоти',
    'item.cost_structure':'Харажат структураси','item.cost_summary':'Харажат хулосаси',
    'item.cost_trend_monthly':'Ойлик тренд','item.inventory_transfer':'Ўтказма сўровлари',
    'item.production_performance':'Ишлаб чиқариш ҳисоботи','item.issue_materials':'Материал чиқими',

    'ui.refresh':'Янгилаш','ui.export_csv':'CSV','ui.search':'Қидириш',
    'ui.from':'Дан','ui.to':'Гача','ui.loading':'Юкланяпти...',
    'ui.no_data':'Маълумот топилмади','ui.records':'та ёзув','ui.logout':'Чиқиш','ui.back':'Орқага',
    'ui.page':'Бет','ui.prev':'Олдинги','ui.next':'Кейингиси',

    'settings.title':'Созламалар','settings.sub':'Сайт созламалари',
    'settings.language':'Тил','settings.lang_desc':'Интерфейс тилини танланг',
    'settings.connected_dbs':'Уланган базалар',

    'login.title':'Tizimga kirish','login.subtitle':"SAP B1 xodim ma'lumotlari",
    'login.employee_code':'Xodim kodi','login.ext_number':'Tashqi xodim raqami',
    'login.ext_hint':"Swagger'dagi «externalEmployeeNumber» qiymati",
    'login.submit':'Kirish','login.loading_btn':'Kuting...',
    'login.checking':'Barcha bazalar tekshirilmoqda...',
    'login.pick_db':'Bazani tanlang','login.pick_db_sub':'Qaysi interfeysga kirishni tanlang',
    'login.error_default':"Login muvaffaqiyatsiz. Ma'lumotlarni tekshiring.",

    'token.connected':'Уланган','token.not_connected':"Yo'q",
    'token.hint':'Логин орқали барча базалар автоматик аниқланади',
  },
  ru: {
    'nav.production':'Производство','nav.rawmat':'Сырьё','nav.silo':'Силос и Цемент',
    'nav.clinker':'Клинкер','nav.quality':'Контроль качества','nav.cost':'Затраты',
    'nav.inventory':'Склад','nav.shifer_overview':'Шифер · Общее',
    'nav.shifer_production':'Шифер · Производство','nav.shifer_rawmat':'Шифер · Сырьё',
    'nav.jbi_production':'ЖБИ · Производство','nav.jbi_rawmat':'ЖБИ · Сырьё',
    'nav.jbi_silo':'ЖБИ · Силос и Цемент','nav.jbi_cement':'ЖБИ · Цемент',
    'nav.jbi_quality':'ЖБИ · Качество',
    'nav.jbi_cost':'ЖБИ · Затраты','nav.jbi_inventory':'ЖБИ · Склад',

    'item.dashboard':'Главная','item.mill_production':'Производство мельницы',
    'item.volume_daily':'Суточный объём','item.shift_performance':'Показатели смены',
    'item.raw_materials_stock':'Остатки','item.raw_material_receipt':'Приход',
    'item.raw_material_consumption':'Расход','item.raw_material_movement':'Движение',
    'item.raw_material_pivot':'Сводная таблица','item.material_vs_bom':'vs BOM',
    'item.material_overconsumption':'Перерасход','item.material_consumption_shift':'Расход по сменам',
    'item.silo_stock':'Остатки силоса','item.cement_consumption':'Расход цемента',
    'item.cement_additive':'Состав добавок','item.clinker_factor':'Клинкерный фактор',
    'item.clinker_trend':'Тренд фактора','item.defect_details':'Детали дефектов',
    'item.cost_structure':'Структура затрат','item.cost_summary':'Итог затрат',
    'item.cost_trend_monthly':'Месячный тренд','item.inventory_transfer':'Перемещения',
    'item.production_performance':'Отчёт производства','item.issue_materials':'Выдача материалов',

    'ui.refresh':'Обновить','ui.export_csv':'CSV','ui.search':'Поиск',
    'ui.from':'От','ui.to':'До','ui.loading':'Загрузка...',
    'ui.no_data':'Данные не найдены','ui.records':'записей','ui.logout':'Выход','ui.back':'Назад',
    'ui.page':'Стр.','ui.prev':'Назад','ui.next':'Вперёд',

    'settings.title':'Настройки','settings.sub':'Параметры сайта',
    'settings.language':'Язык','settings.lang_desc':'Выберите язык интерфейса',
    'settings.connected_dbs':'Подключённые БД',

    'login.title':'Вход в систему','login.subtitle':'Данные сотрудника SAP B1',
    'login.employee_code':'Код сотрудника','login.ext_number':'Внешний номер сотрудника',
    'login.ext_hint':'Значение «externalEmployeeNumber» в Swagger',
    'login.submit':'Войти','login.loading_btn':'Подождите...',
    'login.checking':'Проверяем все базы данных...',
    'login.pick_db':'Выберите базу данных','login.pick_db_sub':'Выберите интерфейс для входа',
    'login.error_default':'Ошибка входа. Проверьте данные.',

    'token.connected':'Подключено','token.not_connected':'Нет',
    'token.hint':'При входе все базы данных определяются автоматически',
  },
  en: {
    'nav.production':'Production','nav.rawmat':'Raw Materials','nav.silo':'Silo & Cement',
    'nav.clinker':'Clinker','nav.quality':'Quality Control','nav.cost':'Costs',
    'nav.inventory':'Inventory','nav.shifer_overview':'Shifer · Overview',
    'nav.shifer_production':'Shifer · Production','nav.shifer_rawmat':'Shifer · Raw Materials',
    'nav.jbi_production':'JBI · Production','nav.jbi_rawmat':'JBI · Raw Materials',
    'nav.jbi_silo':'JBI · Silo & Cement','nav.jbi_cement':'JBI · Cement',
    'nav.jbi_quality':'JBI · Quality',
    'nav.jbi_cost':'JBI · Costs','nav.jbi_inventory':'JBI · Inventory',

    'item.dashboard':'Dashboard','item.mill_production':'Mill Production',
    'item.volume_daily':'Daily Volume','item.shift_performance':'Shift Performance',
    'item.raw_materials_stock':'Stock','item.raw_material_receipt':'Receipt',
    'item.raw_material_consumption':'Consumption','item.raw_material_movement':'Movement',
    'item.raw_material_pivot':'Pivot Table','item.material_vs_bom':'vs BOM',
    'item.material_overconsumption':'Overconsumption','item.material_consumption_shift':'Shift Consumption',
    'item.silo_stock':'Silo Stock','item.cement_consumption':'Cement Consumption',
    'item.cement_additive':'Additive Composition','item.clinker_factor':'Clinker Factor',
    'item.clinker_trend':'Factor Trend','item.defect_details':'Defect Details',
    'item.cost_structure':'Cost Structure','item.cost_summary':'Cost Summary',
    'item.cost_trend_monthly':'Monthly Trend','item.inventory_transfer':'Transfer Requests',
    'item.production_performance':'Production Report','item.issue_materials':'Material Issue',

    'ui.refresh':'Refresh','ui.export_csv':'CSV','ui.search':'Search',
    'ui.from':'From','ui.to':'To','ui.loading':'Loading...',
    'ui.no_data':'No data found','ui.records':'records','ui.logout':'Logout','ui.back':'Back',
    'ui.page':'Page','ui.prev':'Previous','ui.next':'Next',

    'settings.title':'Settings','settings.sub':'Website preferences',
    'settings.language':'Language','settings.lang_desc':'Choose interface language',
    'settings.connected_dbs':'Connected Databases',

    'login.title':'Sign In','login.subtitle':'SAP B1 Employee Credentials',
    'login.employee_code':'Employee Code','login.ext_number':'External Employee Number',
    'login.ext_hint':'The «externalEmployeeNumber» value in Swagger',
    'login.submit':'Sign In','login.loading_btn':'Please wait...',
    'login.checking':'Checking all databases...',
    'login.pick_db':'Choose Database','login.pick_db_sub':'Select which interface to enter',
    'login.error_default':'Login failed. Please check your credentials.',

    'token.connected':'Connected','token.not_connected':'None',
    'token.hint':'All databases are detected automatically when you sign in',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('enzo_lang') || 'uz');

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('enzo_lang', l);
  };

  const t = (key) => LANGS[lang]?.[key] ?? LANGS.uz[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
