import axios from 'axios';

const apiJbi = axios.create({ baseURL: '' });

apiJbi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('enzo_token_jbi');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiJbi.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('enzo_token_jbi');
      window.dispatchEvent(new CustomEvent('jbi-auth-error'));
    }
    return Promise.reject(err);
  }
);

export default apiJbi;

const p = ({ dateFrom, dateTo, itemCode, whsCode, pageSize, skip } = {}) => ({
  startDate: dateFrom,
  endDate:   dateTo,
  ...(itemCode  ? { itemCode }  : {}),
  ...(whsCode   ? { whsCode }   : {}),
  ...(pageSize != null ? { pageSize } : {}),
  ...(skip     != null ? { skip }     : {}),
});

const list    = url => params => apiJbi.get(url, { params: p(params) }).then(r => r.data?.data ?? r.data ?? []);
const noParams = url => ()     => apiJbi.get(url).then(r => r.data?.data ?? r.data ?? []);

export const dashJbi = {
  // Production
  millProduction:            list('/api-jbi/api/dashboard/mill-production'),
  volumeDaily:               list('/api-jbi/api/dashboard/volume-daily'),

  // Raw materials
  rawMaterialsStock:         noParams('/api-jbi/api/dashboard/raw-materials-stock'),
  rawMaterialReceipt:        list('/api-jbi/api/dashboard/raw-material-receipt'),
  rawMaterialConsumption:    list('/api-jbi/api/dashboard/raw-material-consumption'),
  rawMaterialMovement:       list('/api-jbi/api/dashboard/raw-material-movement'),
  rawMaterialPivot:          list('/api-jbi/api/dashboard/raw-material-pivot'),
  materialVsBom:             list('/api-jbi/api/dashboard/material-vs-bom'),
  materialOverconsumption:   list('/api-jbi/api/dashboard/material-overconsumption'),
  materialConsumptionShift:  list('/api-jbi/api/dashboard/material-consumption-shift'),

  // Silo & Cement
  siloStock:                 noParams('/api-jbi/api/dashboard/silo-stock'),
  cementConsumption:         list('/api-jbi/api/dashboard/cement-consumption'),
  cementAdditiveComposition: list('/api-jbi/api/dashboard/cement-additive-composition'),

  // Quality
  defectDetails:             list('/api-jbi/api/dashboard/defect-details'),

  // Cost
  costStructure:             list('/api-jbi/api/dashboard/cost-structure'),
  costSummary:               list('/api-jbi/api/dashboard/cost-summy'),
  costTrendMonthly:          list('/api-jbi/api/dashboard/cost-trend-monthly'),

  // Inventory — SAP B1 OData (dashboard endpoint doesn't exist on JBI backend)
  inventoryTransfer: params => apiJbi.get('/api-jbi/api/InventoryTransferRequests', {
    params: {
      $expand: 'StockTransferLines',
      $filter: `DocDate ge '${params.dateFrom}' and DocDate le '${params.dateTo}'`,
      $top: params.pageSize || 500,
      $orderby: 'DocDate desc',
    },
  }).then(r => {
    const rows = r.data?.value ?? r.data?.data ?? r.data ?? [];
    return rows.flatMap(doc => (doc.StockTransferLines || []).map(l => ({
      docDate: doc.DocDate, docNum: doc.DocNum,
      itemCode: l.ItemCode, itemName: l.ItemDescription || l.ItemCode,
      fromWhsCod: l.FromWarehouseCode, whsCode: l.WarehouseCode,
      quantity: l.Quantity,
    })));
  }),

  // Financial — direct SAP B1 OData via proxy
  sales: params => apiJbi.get('/api-jbi/api/Invoices', {
    params: {
      $expand: 'DocumentLines',
      $filter: `DocDate ge '${params.dateFrom}' and DocDate le '${params.dateTo}'`,
      $top: params.pageSize || 500,
    },
  }).then(r => {
    const rows = r.data?.value ?? r.data?.data ?? r.data ?? [];
    return rows.flatMap(inv => (inv.DocumentLines || []).map(l => ({
      docDate: inv.DocDate, docNum: inv.DocNum, customer: inv.CardName,
      agent: inv.SalesPersonCode, itemName: l.ItemDescription || l.ItemCode,
      quantity: l.Quantity, uom: l.UoMCode, price: l.Price, total: l.LineTotal,
      currency: inv.DocCurrency,
    })));
  }),

  ar: params => apiJbi.get('/api-jbi/api/Invoices', {
    params: {
      $select: 'DocNum,DocDate,DocDueDate,CardName,DocTotal,PaidToDate',
      $filter: `DocDate ge '${params.dateFrom}' and DocDate le '${params.dateTo}' and DocumentStatus eq 'bost_Open'`,
      $top: params.pageSize || 500,
    },
  }).then(r => {
    const rows = r.data?.value ?? r.data?.data ?? r.data ?? [];
    return rows.map(row => ({
      customer: row.CardName, docNum: row.DocNum, docDate: row.DocDate, dueDate: row.DocDueDate,
      total: row.DocTotal, paid: row.PaidToDate,
      balance: ((row.DocTotal || 0) - (row.PaidToDate || 0)).toFixed(2),
      overdueDays: Math.max(0, Math.floor((Date.now() - new Date(row.DocDueDate)) / 86400000)) || null,
    }));
  }),

  ap: params => apiJbi.get('/api-jbi/api/PurchaseInvoices', {
    params: {
      $select: 'DocNum,DocDate,DocDueDate,CardName,DocTotal,PaidToDate',
      $filter: `DocDate ge '${params.dateFrom}' and DocDate le '${params.dateTo}' and DocumentStatus eq 'bost_Open'`,
      $top: params.pageSize || 500,
    },
  }).then(r => {
    const rows = r.data?.value ?? r.data?.data ?? r.data ?? [];
    return rows.map(row => ({
      supplier: row.CardName, docNum: row.DocNum, docDate: row.DocDate, dueDate: row.DocDueDate,
      total: row.DocTotal, paid: row.PaidToDate,
      balance: ((row.DocTotal || 0) - (row.PaidToDate || 0)).toFixed(2),
      overdueDays: Math.max(0, Math.floor((Date.now() - new Date(row.DocDueDate)) / 86400000)) || null,
    }));
  }),

  warehouseStock: () => apiJbi.get('/api-jbi/api/ItemWarehouseInfoCollection', {
    params: {
      $select: 'ItemCode,ItemName,WarehouseCode,OnHand,Committed,Available,UoMCode',
      $top: 1000,
    },
  }).then(r => {
    const rows = r.data?.value ?? r.data?.data ?? r.data ?? [];
    return rows.map(row => ({
      itemCode: row.ItemCode, itemName: row.ItemName, warehouse: row.WarehouseCode,
      onHand: row.OnHand, committed: row.Committed, available: row.Available,
      uom: row.UoMCode || '—', avgCost: row.AvgPrice ?? '—', totalValue: '—',
    }));
  }),
};
