import axios from 'axios';

const api = axios.create({ baseURL: '' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('enzo_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('enzo_user');
      localStorage.removeItem('enzo_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

const p = ({ dateFrom, dateTo, itemCode, whsCode, cardCode, pageSize, skip } = {}) => ({
  StartDate: dateFrom,
  EndDate: dateTo,
  ...(itemCode  ? { itemCode }  : {}),
  ...(whsCode   ? { whsCode }   : {}),
  ...(cardCode  ? { cardCode }  : {}),
  ...(pageSize != null ? { pageSize } : {}),
  ...(skip     != null ? { skip }     : {}),
});

const toArr = v => Array.isArray(v) ? v : [];

const list = url => params =>
  api.get(url, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data));

export const dash = {
  // Production
  millProduction:            list('/api/dashboard/mill-production'),
  volumeDaily:               list('/api/dashboard/volume-daily'),
  shiftPerformance:          list('/api/dashboard/shift-performance'),

  // Raw materials
  rawMaterialsStock:         () => api.get('/api/dashboard/raw-materials-stock').then(r => toArr(r.data?.data ?? r.data)),
  rawMaterialReceipt:        list('/api/dashboard/raw-material-receipt'),
  rawMaterialConsumption:    list('/api/dashboard/raw-material-consumption'),
  rawMaterialMovement:       list('/api/dashboard/raw-material-movement'),
  rawMaterialPivot:          list('/api/dashboard/raw-material-pivot'),
  materialVsBom:             list('/api/dashboard/material-vs-bom'),
  materialOverconsumption:   list('/api/dashboard/material-overconsumption'),
  materialConsumptionShift:  list('/api/dashboard/material-consumption-shift'),

  // Silo & Cement
  siloStock:                 () => api.get('/api/dashboard/silo-stock').then(r => toArr(r.data?.data ?? r.data)),
  cementConsumption:         list('/api/dashboard/cement-consumption'),
  cementAdditiveComposition: list('/api/dashboard/cement-additive-composition'),

  // Clinker
  clinkerFactor:             list('/api/dashboard/clinker-factor'),
  clinkerFactorTrend:        list('/api/dashboard/clinker-factor-trend'),

  // Quality
  defectDetails:             list('/api/dashboard/defect-details'),

  // Cost
  costStructure:             list('/api/dashboard/cost-structure'),
  costSummary:               list('/api/dashboard/cost-summy'),
  costTrendMonthly:          list('/api/dashboard/cost-trend-monthly'),

  // Inventory
  inventoryTransfer:         list('/api/dashboard/inventory-transfer-request'),

  // Product cost (DashboardControllerM)
  productCostStructure: p => api.get('/api/dashboardcontrollerm/cost-structures', { params: p }).then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; }),
  productCostSummary:   p => api.get('/api/dashboardcontrollerm/avar-cost-price', { params: p }).then(r => { const v = r.data?.data ?? r.data; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }),
  itemsList:            () => api.get('/api/dashboardcontrollerm/items-list').then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; }).catch(() => api.get('/api/dashboard/raw-materials-stock').then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; })),
};

const BASE_M = '/api/dashboardcontrollerm';

export const dashCementM = {
  overview:               ()      => api.get(`${BASE_M}/overview`).then(r => { const v = r.data?.data ?? r.data; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }),
  salesOverview:          params  => api.get(`${BASE_M}/sales-overview`, { params: p(params) }).then(r => r.data),
  salesByItems:           params  => api.get(`${BASE_M}/sales-by-items`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  salesByCustomer:        params  => api.get(`${BASE_M}/sales-by-customer`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  stockLow:               params  => api.get(`${BASE_M}/stock-low`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  stockWarehouses:        params  => api.get(`${BASE_M}/stock-warehouses`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  stockMovement:          params  => api.get(`${BASE_M}/stock-movement`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  accountBalance:         ()      => api.get(`${BASE_M}/account-balance`).then(r => toArr(r.data?.data ?? r.data)),
  debitorsList:           params  => api.get(`${BASE_M}/debitors-list`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  debitorsAging:          params  => api.get(`${BASE_M}/debitors-aging`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  debitorsReconciliation: params  => api.get(`${BASE_M}/debitors-reconciliation`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  creditorsList:          params  => api.get(`${BASE_M}/creditors-list`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  creditorReconciliation: params  => api.get(`${BASE_M}/creditor-reconciliation`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  incomingPayment:        params  => api.get(`${BASE_M}/incoming-payment`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  outgoingPayment:        params  => api.get(`${BASE_M}/outgoing-payment`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  pnlSummary:             params  => api.get(`${BASE_M}/pnl-summary`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  pnlDetails:             params  => api.get(`${BASE_M}/pnl-details`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  expensesList:           params  => api.get(`${BASE_M}/expenses-list`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  expensesSummary:        params  => api.get(`${BASE_M}/expenses-summary`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  productCostStructure:   params  => api.get(`${BASE_M}/cost-structures`, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data)),
  productCostSummary:     params  => api.get(`${BASE_M}/avar-cost-price`, { params: p(params) }).then(r => { const v = r.data?.data ?? r.data; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }),
  itemsList:              ()      => api.get(`${BASE_M}/items-list`).then(r => toArr(r.data?.data ?? r.data)).catch(() => api.get(`${BASE_M}/stock-warehouses`).then(r => toArr(r.data?.data ?? r.data))),
};

export const fmt = n => {
  const num = parseFloat(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString('ru-RU');
};

export const fmtFull = n => (parseFloat(n) || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 });

export const fmtN = (n, d = 2) => (parseFloat(n) || 0).toLocaleString('ru-RU', { maximumFractionDigits: d, minimumFractionDigits: d });
