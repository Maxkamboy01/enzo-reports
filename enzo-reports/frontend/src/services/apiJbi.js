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

// JBI date format: DDMMYYYY (e.g. 2026-05-03 → 03052026)
const jbiDate = iso => iso ? iso.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3$2$1') : undefined;

// JBI Swagger uses StartDate/EndDate (capital S/E) in DDMMYYYY format
const p = ({ dateFrom, dateTo, itemCode, whsCode, pageSize, skip } = {}) => ({
  StartDate: jbiDate(dateFrom),
  EndDate:   jbiDate(dateTo),
  ...(itemCode  ? { itemCode }  : {}),
  ...(whsCode   ? { whsCode }   : {}),
  ...(pageSize != null ? { pageSize } : {}),
  ...(skip     != null ? { skip }     : {}),
});

const pM = ({ dateFrom, dateTo, cardCode, itemCode, whsCode } = {}) => ({
  ...(dateFrom ? { StartDate: jbiDate(dateFrom) } : {}),
  ...(dateTo   ? { EndDate:   jbiDate(dateTo) }   : {}),
  ...(cardCode  ? { cardCode }  : {}),
  ...(itemCode  ? { itemCode }  : {}),
  ...(whsCode   ? { whsCode }   : {}),
});

const toArr = v => Array.isArray(v) ? v : [];
const list     = url => params => apiJbi.get(url, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data));
const noParams = url => ()     => apiJbi.get(url).then(r => toArr(r.data?.data ?? r.data));

export const dashJbi = {
  // Production
  millProduction:            list('/api-jbi/api/dashboard/mill-production'),
  volumeDaily:               list('/api-jbi/api/dashboard/volume-daily'),

  // Raw materials — stock has NO date params per Swagger
  rawMaterialsStock:         noParams('/api-jbi/api/dashboard/raw-materials-stock'),
  rawMaterialReceipt:        list('/api-jbi/api/dashboard/raw-material-receipt'),
  rawMaterialConsumption:    list('/api-jbi/api/dashboard/raw-material-consumption'),
  rawMaterialMovement:       list('/api-jbi/api/dashboard/raw-material-movement'),
  rawMaterialPivot:          list('/api-jbi/api/dashboard/raw-material-pivot'),
  materialVsBom:             list('/api-jbi/api/dashboard/material-vs-bom'),
  materialOverconsumption:   list('/api-jbi/api/dashboard/material-overconsumption'),

  // Cement
  cementConsumption:         list('/api-jbi/api/dashboard/cement-consumption'),
  cementAdditiveComposition: list('/api-jbi/api/dashboard/cement-additive-composition'),

  // Quality
  defectDetails:             list('/api-jbi/api/dashboard/defect-details'),

  // Cost
  costStructure:             list('/api-jbi/api/dashboard/cost-structure'),
  costSummary:               list('/api-jbi/api/dashboard/cost-summy'),
  costTrendMonthly:          list('/api-jbi/api/dashboard/cost-trend-monthly'),

  // Inventory
  inventoryTransfer:         list('/api-jbi/api/dashboard/inventory-transfer-request'),

  // Product cost (DashboardControllerM)
  productCostStructure: p => apiJbi.get('/api-jbi/api/dashboardcontrollerm/cost-structures', { params: p }).then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; }),
  productCostSummary:   p => apiJbi.get('/api-jbi/api/dashboardcontrollerm/avar-cost-price', { params: p }).then(r => { const v = r.data?.data ?? r.data; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }),
  itemsList:            () => apiJbi.get('/api-jbi/api/dashboardcontrollerm/items-list').then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; }).catch(() => apiJbi.get('/api-jbi/api/dashboard/raw-materials-stock').then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; })),
};

const BASE_M = '/api-jbi/api/dashboardcontrollerm';
const getM = (url, params) => apiJbi.get(url, params !== undefined ? { params } : undefined).then(r => r.data);

export const dashJbiM = {
  overview:               ()  => getM(`${BASE_M}/overview`).then(v => { const d = v?.data ?? v; return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }),
  salesOverview:          p   => getM(`${BASE_M}/sales-overview`, pM(p)),
  salesByItems:           p   => getM(`${BASE_M}/sales-by-items`, pM(p)).then(toArr),
  salesByCustomer:        p   => getM(`${BASE_M}/sales-by-customer`, pM(p)).then(toArr),
  stockLow:               p   => getM(`${BASE_M}/stock-low`, pM(p)).then(toArr),
  stockWarehouses:        p   => getM(`${BASE_M}/stock-warehouses`, pM(p)).then(toArr),
  stockMovement:          p   => getM(`${BASE_M}/stock-movement`, pM(p)).then(toArr),
  accountBalance:         ()  => getM(`${BASE_M}/account-balance`).then(toArr),
  debitorsList:           p   => getM(`${BASE_M}/debitors-list`, pM(p)).then(toArr),
  debitorsAging:          p   => getM(`${BASE_M}/debitors-aging`, pM(p)).then(toArr),
  debitorsReconciliation: p   => getM(`${BASE_M}/debitors-reconciliation`, pM(p)).then(toArr),
  creditorsList:          p   => getM(`${BASE_M}/creditors-list`, pM(p)).then(toArr),
  creditorReconciliation: p   => getM(`${BASE_M}/creditor-reconciliation`, pM(p)).then(toArr),
  incomingPayment:        p   => getM(`${BASE_M}/incoming-payment`, pM(p)).then(toArr),
  outgoingPayment:        p   => getM(`${BASE_M}/outgoing-payment`, pM(p)).then(toArr),
  pnlSummary:             p   => getM(`${BASE_M}/pnl-summary`, pM(p)).then(toArr),
  pnlDetails:             p   => getM(`${BASE_M}/pnl-details`, pM(p)).then(toArr),
  expensesList:           p   => getM(`${BASE_M}/expenses-list`, pM(p)).then(toArr),
  expensesSummary:        p   => getM(`${BASE_M}/expenses-summary`, pM(p)).then(toArr),
  productCostStructure:   p   => getM(`${BASE_M}/cost-structures`, pM(p)).then(toArr),
  productCostSummary:     p   => getM(`${BASE_M}/avar-cost-price`, pM(p)).then(v => { const d = v?.data ?? v; return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }),
  itemsList:              ()  => getM(`${BASE_M}/items-list`).then(toArr).catch(() => getM(`${BASE_M}/stock-warehouses`).then(toArr)),
};
