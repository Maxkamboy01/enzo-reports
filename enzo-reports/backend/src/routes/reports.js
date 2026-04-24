import { sapGet } from '../services/sapService.js';
import { buildExcel } from '../services/excelService.js';

// ─── SAP B1 OData queries per report ─────────────────────────────────────────

const REPORT_CONFIGS = {
  // ── Cement ──────────────────────────────────────────────────────────────────
  cement: {
    rnp: {
      title: 'РНП — Режа/Факт (Цемент)',
      columns: [
        { key: 'Department', label: 'Бўлим' },
        { key: 'Indicator', label: 'Кўрсаткич' },
        { key: 'Responsible', label: 'Жавобгар' },
        { key: 'PlanPct', label: 'Режа %', right: true },
        { key: 'PlanVal', label: 'Режа кўр.', right: true },
        { key: 'FactPct', label: 'Факт %', right: true },
        { key: 'FactVal', label: 'Факт кўр.', right: true },
        { key: 'Total', label: 'Жами', right: true },
      ],
      fetch: (db, p) => sapGet(db, `ProductionOrders?$select=DocEntry,DocNum,ItemNo,PlannedQuantity,CmpltQty,PostingDate&$filter=PostingDate ge '${p.dateFrom}' and PostingDate le '${p.dateTo}'&$orderby=PostingDate desc&$top=500`),
      transform: rows => rows.map(r => ({
        Department: r.ItemNo, Indicator: r.DocNum, Responsible: '—',
        PlanPct: '—', PlanVal: r.PlannedQuantity, FactPct: '—', FactVal: r.CmpltQty,
        Total: r.PlannedQuantity,
      })),
    },
    mill: {
      title: 'Тегирмон участкаси',
      columns: [
        { key: 'DocDate', label: 'Сана' },
        { key: 'ItemCode', label: 'Маҳсулот' },
        { key: 'Quantity', label: 'Миқдор', right: true },
        { key: 'Warehouse', label: 'Склад' },
      ],
      fetch: (db, p) => sapGet(db, `InventoryGenEntries?$select=DocDate,ItemCode,Quantity,WarehouseCode&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, Quantity: r.Quantity, Warehouse: r.WarehouseCode })),
    },
    lab: {
      title: 'Лаборатория (Цемент)',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' },
        { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'UoM', label: 'Ўлчов' },
      ],
      fetch: (db, p) => sapGet(db, `InventoryGenExits?$select=DocDate,ItemCode,Quantity,UoMCode&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, Quantity: r.Quantity, UoM: r.UoMCode })),
    },
    consumption: {
      title: 'Цемент сарфи',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' },
        { key: 'Quantity', label: 'Сарф', right: true }, { key: 'Warehouse', label: 'Склад' },
      ],
      fetch: (db, p) => sapGet(db, `InventoryGenExits?$select=DocDate,ItemCode,Quantity,WarehouseCode&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, Quantity: r.Quantity, Warehouse: r.WarehouseCode })),
    },
    rawmaterials: {
      title: 'Хом ашё сарфи (Цемент)',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Код' },
        { key: 'ItemDesc', label: 'Номи' }, { key: 'Quantity', label: 'Миқдор', right: true },
        { key: 'UoM', label: 'Ўлчов' }, { key: 'Price', label: 'Нарх', right: true },
        { key: 'LineTotal', label: 'Жами', right: true },
      ],
      fetch: (db, p) => sapGet(db, `PurchaseInvoices?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=200`),
      transform: rows => rows.flatMap(inv => (inv.DocumentLines || []).map(l => ({
        DocDate: inv.DocDate, ItemCode: l.ItemCode, ItemDesc: l.ItemDescription,
        Quantity: l.Quantity, UoM: l.UoMCode, Price: l.Price, LineTotal: l.LineTotal,
      }))),
    },
    incoming: {
      title: 'Олиб келинган хом ашё',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Хужжат №' },
        { key: 'CardName', label: 'Таминотчи' }, { key: 'ItemCode', label: 'Код' },
        { key: 'ItemDesc', label: 'Номи' }, { key: 'Quantity', label: 'Миқдор', right: true },
        { key: 'Price', label: 'Нарх', right: true }, { key: 'LineTotal', label: 'Жами', right: true },
      ],
      fetch: (db, p) => sapGet(db, `PurchaseDeliveryNotes?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=200`),
      transform: rows => rows.flatMap(doc => (doc.DocumentLines || []).map(l => ({
        DocDate: doc.DocDate, DocNum: doc.DocNum, CardName: doc.CardName,
        ItemCode: l.ItemCode, ItemDesc: l.ItemDescription, Quantity: l.Quantity,
        Price: l.Price, LineTotal: l.LineTotal,
      }))),
    },
    daily: {
      title: 'Кунлик цемент хисоби',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' },
        { key: 'InQty', label: 'Кирим', right: true }, { key: 'OutQty', label: 'Сарф', right: true },
        { key: 'Balance', label: 'Қолдиқ', right: true }, { key: 'Warehouse', label: 'Склад' },
      ],
      fetch: (db, p) => sapGet(db, `InventoryPostings?$select=DocDate,ItemCode,InQty,OutQty,Balance,WarehouseCode&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, InQty: r.InQty, OutQty: r.OutQty, Balance: r.Balance, Warehouse: r.WarehouseCode })),
    },
    sales: {
      title: 'Сотув (Цемент)',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Инвойс №' },
        { key: 'CardName', label: 'Харидор' }, { key: 'SalesPersonCode', label: 'Агент' },
        { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'Quantity', label: 'Миқдор', right: true },
        { key: 'Price', label: 'Нарх', right: true }, { key: 'LineTotal', label: 'Жами', right: true },
        { key: 'DocCurrency', label: 'Валюта' },
      ],
      fetch: (db, p) => {
        let filter = `DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'`;
        if (p.customer) filter += ` and contains(CardName,'${p.customer}')`;
        return sapGet(db, `Invoices?$expand=DocumentLines&$filter=${filter}&$orderby=DocDate desc&$top=300`);
      },
      transform: (rows, p) => rows.flatMap(inv => (inv.DocumentLines || []).map(l => ({
        DocDate: inv.DocDate, DocNum: inv.DocNum, CardName: inv.CardName,
        SalesPersonCode: inv.SalesPersonCode, ItemCode: l.ItemCode,
        Quantity: l.Quantity, Price: l.Price, LineTotal: l.LineTotal,
        DocCurrency: inv.DocCurrency,
      }))).filter(r => !p.agent || String(r.SalesPersonCode) === p.agent || r.SalesPersonCode?.toString().includes(p.agent)),
    },
    ar: {
      title: 'Дебиторлар (Цемент)',
      columns: [
        { key: 'CardName', label: 'Харидор' }, { key: 'DocNum', label: 'Хужжат №' },
        { key: 'DocDate', label: 'Сана' }, { key: 'DocDueDate', label: 'Тўлов муддати' },
        { key: 'DocTotal', label: 'Жами', right: true }, { key: 'PaidToDate', label: 'Тўланди', right: true },
        { key: 'Balance', label: 'Қолдиқ', right: true }, { key: 'Overdue', label: 'Кечикиш', right: true },
      ],
      fetch: (db, p) => sapGet(db, `Invoices?$select=DocNum,DocDate,DocDueDate,CardName,DocTotal,PaidToDate,DocCurrency&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}' and DocumentStatus eq 'bost_Open'&$top=500`),
      transform: rows => rows.map(r => {
        const balance = (r.DocTotal || 0) - (r.PaidToDate || 0);
        const due = new Date(r.DocDueDate);
        const overdue = Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
        return { ...r, Balance: balance.toFixed(2), Overdue: overdue || null };
      }),
    },
    ap: {
      title: 'Кредиторлар (Цемент)',
      columns: [
        { key: 'CardName', label: 'Таминотчи' }, { key: 'DocNum', label: 'Хужжат №' },
        { key: 'DocDate', label: 'Сана' }, { key: 'DocDueDate', label: 'Тўлов муддати' },
        { key: 'DocTotal', label: 'Жами', right: true }, { key: 'PaidToDate', label: 'Тўланди', right: true },
        { key: 'Balance', label: 'Қолдиқ', right: true }, { key: 'Overdue', label: 'Кечикиш', right: true },
      ],
      fetch: (db, p) => sapGet(db, `PurchaseInvoices?$select=DocNum,DocDate,DocDueDate,CardName,DocTotal,PaidToDate&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}' and DocumentStatus eq 'bost_Open'&$top=500`),
      transform: rows => rows.map(r => {
        const balance = (r.DocTotal || 0) - (r.PaidToDate || 0);
        const due = new Date(r.DocDueDate);
        const overdue = Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
        return { ...r, Balance: balance.toFixed(2), Overdue: overdue || null };
      }),
    },
    warehouse: {
      title: 'Склад қолдиқлари (Цемент)',
      columns: [
        { key: 'ItemCode', label: 'Код' }, { key: 'ItemName', label: 'Маҳсулот' },
        { key: 'WarehouseCode', label: 'Склад' }, { key: 'OnHand', label: 'Қолдиқ', right: true },
        { key: 'Committed', label: 'Банд', right: true }, { key: 'Available', label: 'Мавжуд', right: true },
      ],
      fetch: (db) => sapGet(db, `ItemWarehouseInfoCollection?$select=ItemCode,ItemName,WarehouseCode,OnHand,Committed,Available&$top=1000`),
      transform: rows => rows,
    },
  },

  // ── Shifer (mirror same pattern, different data) ─────────────────────────
  shifer: {
    production: {
      title: 'Шифер цехи РНП',
      columns: [
        { key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Буюртма №' },
        { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'PlannedQty', label: 'Режа', right: true },
        { key: 'CompletedQty', label: 'Факт', right: true }, { key: 'Status', label: 'Ҳолат' },
      ],
      fetch: (db, p) => sapGet(db, `ProductionOrders?$select=DocDate,DocNum,ItemNo,PlannedQuantity,CmpltQty,Status&$filter=PostingDate ge '${p.dateFrom}' and PostingDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.PostingDate || r.DocDate, DocNum: r.DocNum, ItemCode: r.ItemNo, PlannedQty: r.PlannedQuantity, CompletedQty: r.CmpltQty, Status: r.Status })),
    },
    energy: {
      title: 'Энергетика',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'Account', label: 'Хисоб' }, { key: 'Debit', label: 'Дебет', right: true }, { key: 'Credit', label: 'Кредит', right: true }],
      fetch: (db, p) => sapGet(db, `JournalEntries?$expand=JournalEntryLines&$filter=ReferenceDate ge '${p.dateFrom}' and ReferenceDate le '${p.dateTo}'&$top=200`),
      transform: rows => rows.flatMap(j => (j.JournalEntryLines || []).map(l => ({ DocDate: j.ReferenceDate, Account: l.AccountCode, Debit: l.Debit, Credit: l.Credit }))),
    },
    lab: {
      title: 'Лаборатория (Шифер)',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'UoM', label: 'Ўлчов' }],
      fetch: (db, p) => sapGet(db, `InventoryGenExits?$select=DocDate,ItemCode,Quantity,UoMCode&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, Quantity: r.Quantity, UoM: r.UoMCode })),
    },
    sales: {
      title: 'Шифер сотуви',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Инвойс №' }, { key: 'CardName', label: 'Харидор' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'LineTotal', label: 'Жами', right: true }],
      fetch: (db, p) => sapGet(db, `Invoices?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=300`),
      transform: rows => rows.flatMap(inv => (inv.DocumentLines || []).map(l => ({ DocDate: inv.DocDate, DocNum: inv.DocNum, CardName: inv.CardName, Quantity: l.Quantity, LineTotal: l.LineTotal }))),
    },
    accounting: {
      title: 'Умумий шифер хисоби',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'InQty', label: 'Кирим', right: true }, { key: 'OutQty', label: 'Сарф', right: true }, { key: 'Balance', label: 'Қолдиқ', right: true }],
      fetch: (db, p) => sapGet(db, `InventoryPostings?$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, InQty: r.InQty, OutQty: r.OutQty, Balance: r.Balance })),
    },
    rawmat1: {
      title: 'Хом ашё хисоби 1-га',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Код' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'LineTotal', label: 'Жами', right: true }],
      fetch: (db, p) => sapGet(db, `PurchaseDeliveryNotes?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=200`),
      transform: rows => rows.flatMap(d => (d.DocumentLines || []).map(l => ({ DocDate: d.DocDate, ItemCode: l.ItemCode, Quantity: l.Quantity, LineTotal: l.LineTotal }))),
    },
    rawmat2: {
      title: 'Хом ашё хисоби 2-га',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Код' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'LineTotal', label: 'Жами', right: true }],
      fetch: (db, p) => sapGet(db, `PurchaseDeliveryNotes?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=200`),
      transform: rows => rows.flatMap(d => (d.DocumentLines || []).map(l => ({ DocDate: d.DocDate, ItemCode: l.ItemCode, Quantity: l.Quantity, LineTotal: l.LineTotal }))),
    },
    returns1: {
      title: 'Возврадлар 1-цех',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Хужжат №' }, { key: 'CardName', label: 'Харидор' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'LineTotal', label: 'Жами', right: true }],
      fetch: (db, p) => sapGet(db, `Returns?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=300`),
      transform: rows => rows.flatMap(r => (r.DocumentLines || []).map(l => ({ DocDate: r.DocDate, DocNum: r.DocNum, CardName: r.CardName, Quantity: l.Quantity, LineTotal: l.LineTotal }))),
    },
    returns2: {
      title: 'Возврадлар 2-цех',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Хужжат №' }, { key: 'CardName', label: 'Харидор' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'LineTotal', label: 'Жами', right: true }],
      fetch: (db, p) => sapGet(db, `Returns?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=300`),
      transform: rows => rows.flatMap(r => (r.DocumentLines || []).map(l => ({ DocDate: r.DocDate, DocNum: r.DocNum, CardName: r.CardName, Quantity: l.Quantity, LineTotal: l.LineTotal }))),
    },
    ar: {
      title: 'Дебиторлар (Шифер)',
      columns: [{ key: 'CardName', label: 'Харидор' }, { key: 'DocNum', label: 'Инвойс №' }, { key: 'DocDate', label: 'Сана' }, { key: 'DocTotal', label: 'Жами', right: true }, { key: 'PaidToDate', label: 'Тўланди', right: true }, { key: 'Balance', label: 'Қолдиқ', right: true }],
      fetch: (db, p) => sapGet(db, `Invoices?$select=DocNum,DocDate,DocDueDate,CardName,DocTotal,PaidToDate&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}' and DocumentStatus eq 'bost_Open'&$top=500`),
      transform: rows => rows.map(r => ({ ...r, Balance: ((r.DocTotal || 0) - (r.PaidToDate || 0)).toFixed(2) })),
    },
    ap: {
      title: 'Кредиторлар (Шифер)',
      columns: [{ key: 'CardName', label: 'Таминотчи' }, { key: 'DocNum', label: 'Инвойс №' }, { key: 'DocDate', label: 'Сана' }, { key: 'DocTotal', label: 'Жами', right: true }, { key: 'PaidToDate', label: 'Тўланди', right: true }, { key: 'Balance', label: 'Қолдиқ', right: true }],
      fetch: (db, p) => sapGet(db, `PurchaseInvoices?$select=DocNum,DocDate,DocDueDate,CardName,DocTotal,PaidToDate&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}' and DocumentStatus eq 'bost_Open'&$top=500`),
      transform: rows => rows.map(r => ({ ...r, Balance: ((r.DocTotal || 0) - (r.PaidToDate || 0)).toFixed(2) })),
    },
    warehouse: {
      title: 'Склад қолдиқлари (Шифер)',
      columns: [{ key: 'ItemCode', label: 'Код' }, { key: 'ItemName', label: 'Маҳсулот' }, { key: 'WarehouseCode', label: 'Склад' }, { key: 'OnHand', label: 'Қолдиқ', right: true }, { key: 'Committed', label: 'Банд', right: true }, { key: 'Available', label: 'Мавжуд', right: true }],
      fetch: (db) => sapGet(db, `ItemWarehouseInfoCollection?$select=ItemCode,ItemName,WarehouseCode,OnHand,Committed,Available&$top=1000`),
      transform: rows => rows,
    },
  },

  // ── JBI ─────────────────────────────────────────────────────────────────────
  jbi: {
    lab: {
      title: 'ЖБ Лаборатория',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'Warehouse', label: 'Склад' }],
      fetch: (db, p) => sapGet(db, `InventoryGenExits?$select=DocDate,ItemCode,Quantity,WarehouseCode&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, Quantity: r.Quantity, Warehouse: r.WarehouseCode })),
    },
    cement: {
      title: 'Темир-бетон цемент сарфи',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'InQty', label: 'Кирим', right: true }, { key: 'OutQty', label: 'Сарф', right: true }, { key: 'Balance', label: 'Қолдиқ', right: true }],
      fetch: (db, p) => sapGet(db, `InventoryPostings?$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, InQty: r.InQty, OutQty: r.OutQty, Balance: r.Balance })),
    },
    gonchilar: {
      title: 'Гончилар участкаси',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'ItemCode', label: 'Маҳсулот' }, { key: 'Quantity', label: 'Сарф', right: true }, { key: 'Warehouse', label: 'Склад' }],
      fetch: (db, p) => sapGet(db, `InventoryGenExits?$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=500`),
      transform: rows => rows.map(r => ({ DocDate: r.DocDate, ItemCode: r.ItemCode, Quantity: r.Quantity, Warehouse: r.WarehouseCode })),
    },
    sales: {
      title: 'Сотув (ЖБИ)',
      columns: [{ key: 'DocDate', label: 'Сана' }, { key: 'DocNum', label: 'Инвойс №' }, { key: 'CardName', label: 'Харидор' }, { key: 'Quantity', label: 'Миқдор', right: true }, { key: 'LineTotal', label: 'Жами', right: true }],
      fetch: (db, p) => sapGet(db, `Invoices?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=300`),
      transform: rows => rows.flatMap(inv => (inv.DocumentLines || []).map(l => ({ DocDate: inv.DocDate, DocNum: inv.DocNum, CardName: inv.CardName, Quantity: l.Quantity, LineTotal: l.LineTotal }))),
    },
    ar: {
      title: 'Дебиторлар (ЖБИ)',
      columns: [{ key: 'CardName', label: 'Харидор' }, { key: 'DocNum', label: 'Инвойс №' }, { key: 'DocDate', label: 'Сана' }, { key: 'DocTotal', label: 'Жами', right: true }, { key: 'PaidToDate', label: 'Тўланди', right: true }, { key: 'Balance', label: 'Қолдиқ', right: true }],
      fetch: (db, p) => sapGet(db, `Invoices?$select=DocNum,DocDate,CardName,DocTotal,PaidToDate&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}' and DocumentStatus eq 'bost_Open'&$top=500`),
      transform: rows => rows.map(r => ({ ...r, Balance: ((r.DocTotal || 0) - (r.PaidToDate || 0)).toFixed(2) })),
    },
    ap: {
      title: 'Кредиторлар (ЖБИ)',
      columns: [{ key: 'CardName', label: 'Таминотчи' }, { key: 'DocNum', label: 'Инвойс №' }, { key: 'DocDate', label: 'Сана' }, { key: 'DocTotal', label: 'Жами', right: true }, { key: 'PaidToDate', label: 'Тўланди', right: true }, { key: 'Balance', label: 'Қолдиқ', right: true }],
      fetch: (db, p) => sapGet(db, `PurchaseInvoices?$select=DocNum,DocDate,CardName,DocTotal,PaidToDate&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}' and DocumentStatus eq 'bost_Open'&$top=500`),
      transform: rows => rows.map(r => ({ ...r, Balance: ((r.DocTotal || 0) - (r.PaidToDate || 0)).toFixed(2) })),
    },
    warehouse: {
      title: 'Склад қолдиқлари (ЖБИ)',
      columns: [{ key: 'ItemCode', label: 'Код' }, { key: 'ItemName', label: 'Маҳсулот' }, { key: 'WarehouseCode', label: 'Склад' }, { key: 'OnHand', label: 'Қолдиқ', right: true }, { key: 'Available', label: 'Мавжуд', right: true }],
      fetch: (db) => sapGet(db, `ItemWarehouseInfoCollection?$select=ItemCode,ItemName,WarehouseCode,OnHand,Available&$top=1000`),
      transform: rows => rows,
    },
  },

  // ── Common ──────────────────────────────────────────────────────────────────
  common: {
    'sales-by-agent': {
      title: 'Сотув — Агентлар бўйича',
      columns: [
        { key: 'SalesPersonCode', label: 'Агент' }, { key: 'db', label: 'База' },
        { key: 'CardName', label: 'Харидор' }, { key: 'DocNum', label: 'Инвойс №' },
        { key: 'DocDate', label: 'Сана' }, { key: 'LineTotal', label: 'Жами', right: true },
      ],
      fetch: async (db, p) => {
        const dbs = p.db === 'all' ? ['cement', 'shifer', 'jbi'] : [p.db];
        const results = await Promise.allSettled(
          dbs.map(d => sapGet(d, `Invoices?$expand=DocumentLines&$filter=DocDate ge '${p.dateFrom}' and DocDate le '${p.dateTo}'&$top=300`).then(rows => rows.flatMap(inv => (inv.DocumentLines || []).map(l => ({
            SalesPersonCode: inv.SalesPersonCode, db: d.toUpperCase(),
            CardName: inv.CardName, DocNum: inv.DocNum, DocDate: inv.DocDate, LineTotal: l.LineTotal,
          })))))
        );
        return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
      },
      transform: (rows, p) => {
        if (!p.agent) return rows;
        return rows.filter(r => String(r.SalesPersonCode).includes(p.agent));
      },
    },
    expenses: {
      title: 'Харажатлар',
      columns: [{ key: 'RefDate', label: 'Сана' }, { key: 'Account', label: 'Хисоб' }, { key: 'ShortName', label: 'Изох' }, { key: 'Debit', label: 'Дебет', right: true }, { key: 'Credit', label: 'Кредит', right: true }],
      fetch: async (db, p) => {
        const dbs = p.db === 'all' ? ['cement', 'shifer', 'jbi'] : [p.db];
        const results = await Promise.allSettled(
          dbs.map(d => sapGet(d, `JournalEntries?$expand=JournalEntryLines&$filter=ReferenceDate ge '${p.dateFrom}' and ReferenceDate le '${p.dateTo}'&$top=300`).then(rows => rows.flatMap(j => (j.JournalEntryLines || []).map(l => ({ RefDate: j.ReferenceDate, Account: l.AccountCode, ShortName: l.ShortName, Debit: l.Debit, Credit: l.Credit })))))
        );
        return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
      },
      transform: rows => rows,
    },
    'income-statement': {
      title: 'Молиявий натижа',
      columns: [{ key: 'Account', label: 'Хисоб' }, { key: 'AccountName', label: 'Номи' }, { key: 'Debit', label: 'Дебет', right: true }, { key: 'Credit', label: 'Кредит', right: true }],
      fetch: async (db, p) => {
        const dbs = p.db === 'all' ? ['cement', 'shifer', 'jbi'] : [p.db];
        const results = await Promise.allSettled(
          dbs.map(d => sapGet(d, `ChartOfAccounts?$select=Code,Name,Balance&$filter=ExternalCode ne ''&$top=500`).then(rows => rows.map(r => ({ Account: r.Code, AccountName: r.Name, Debit: r.Balance > 0 ? r.Balance : 0, Credit: r.Balance < 0 ? Math.abs(r.Balance) : 0 }))))
        );
        return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
      },
      transform: rows => rows,
    },
  },
};

// ─── Route handler ─────────────────────────────────────────────────────────

export default async function reportRoutes(fastify) {
  // GET /api/reports/:db/:report
  fastify.get('/api/reports/:db/:report', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const { db, report } = req.params;
    const params = req.query;

    const cfg = REPORT_CONFIGS[db]?.[report];
    if (!cfg) return reply.code(404).send({ message: `Хисобот топилмади: ${db}/${report}` });

    try {
      const rawRows = await cfg.fetch(db, params);
      const rows = cfg.transform ? cfg.transform(rawRows, params) : rawRows;
      return { rows, total: rows.length };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(502).send({ message: 'SAP B1 Service Layer билан боғланишда хато', detail: err.message });
    }
  });

  // GET /api/reports/:db/:report/export
  fastify.get('/api/reports/:db/:report/export', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const { db, report } = req.params;
    const params = req.query;

    const cfg = REPORT_CONFIGS[db]?.[report];
    if (!cfg) return reply.code(404).send({ message: 'Хисобот топилмади' });

    try {
      const rawRows = await cfg.fetch(db, params);
      const rows = cfg.transform ? cfg.transform(rawRows, params) : rawRows;
      const buf = await buildExcel(cfg.title, cfg.columns, rows);

      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${report}-${new Date().toISOString().slice(0, 10)}.xlsx"`);
      return reply.send(Buffer.from(buf));
    } catch (err) {
      fastify.log.error(err);
      return reply.code(502).send({ message: 'Excel яратишда хато', detail: err.message });
    }
  });
}
