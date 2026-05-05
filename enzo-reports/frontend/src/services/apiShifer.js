import axios from 'axios';

const apiShifer = axios.create({ baseURL: '' });

apiShifer.interceptors.request.use(cfg => {
  const token = localStorage.getItem('enzo_token_shifer');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiShifer.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('enzo_token_shifer');
      window.dispatchEvent(new CustomEvent('shifer-auth-error'));
    }
    return Promise.reject(err);
  }
);

export default apiShifer;

const p = ({ dateFrom, dateTo, itemCode, whsCode, pageSize, skip } = {}) => ({
  startDate:  dateFrom,
  endDate:    dateTo,
  ...(itemCode  ? { itemCode }  : {}),
  ...(whsCode   ? { whsCode }   : {}),
  ...(pageSize != null ? { pageSize } : {}),
  ...(skip     != null ? { skip }     : {}),
});

const toArr = v => Array.isArray(v) ? v : [];

const list = url => params =>
  apiShifer.get(url, { params: p(params) }).then(r => toArr(r.data?.data ?? r.data));

const noParams = url => () =>
  apiShifer.get(url).then(r => toArr(r.data?.data ?? r.data));

export const dashShifer = {
  // Shifer-specific
  productionPerformReports: list('/api-shifer/api/dashboard/production-perform-reports'),
  issueItemMetaterials:     list('/api-shifer/api/dashboard/issue-item-metaterials'),

  // Production
  millProduction:            list('/api-shifer/api/dashboard/mill-production'),
  volumeDaily:               list('/api-shifer/api/dashboard/volume-daily'),
  shiftPerformance:          list('/api-shifer/api/dashboard/shift-performance'),

  // Raw materials
  rawMaterialsStock:         noParams('/api-shifer/api/dashboard/raw-materials-stock'),
  rawMaterialReceipt:        list('/api-shifer/api/dashboard/raw-material-receipt'),
  rawMaterialConsumption:    list('/api-shifer/api/dashboard/raw-material-consumption'),
  rawMaterialMovement:       list('/api-shifer/api/dashboard/raw-material-movement'),
  rawMaterialPivot:          list('/api-shifer/api/dashboard/raw-material-pivot'),
  materialVsBom:             list('/api-shifer/api/dashboard/material-vs-bom'),
  materialOverconsumption:   list('/api-shifer/api/dashboard/material-overconsumption'),
  materialConsumptionShift:  list('/api-shifer/api/dashboard/material-consumption-shift'),

  // Silo & Cement
  siloStock:                 noParams('/api-shifer/api/dashboard/silo-stock'),
  cementConsumption:         list('/api-shifer/api/dashboard/cement-consumption'),
  cementAdditiveComposition: list('/api-shifer/api/dashboard/cement-additive-composition'),

  // Clinker
  clinkerFactor:             list('/api-shifer/api/dashboard/clinker-factor'),
  clinkerFactorTrend:        list('/api-shifer/api/dashboard/clinker-factor-trend'),

  // Quality
  defectDetails:             list('/api-shifer/api/dashboard/defect-details'),

  // Cost
  costStructure:             list('/api-shifer/api/dashboard/cost-structure'),
  costSummary:               list('/api-shifer/api/dashboard/cost-summy'),
  costTrendMonthly:          list('/api-shifer/api/dashboard/cost-trend-monthly'),

  // Inventory
  inventoryTransfer:         list('/api-shifer/api/dashboard/inventory-transfer-request'),

  // Product cost (DashboardControllerM)
  productCostStructure: p => apiShifer.get('/api-shifer/api/dashboardcontrollerm/cost-structures', { params: p }).then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; }),
  productCostSummary:   p => apiShifer.get('/api-shifer/api/dashboardcontrollerm/avar-cost-price', { params: p }).then(r => { const v = r.data?.data ?? r.data; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }),
  itemsList:            () => apiShifer.get('/api-shifer/api/dashboardcontrollerm/items-list').then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; }).catch(() => apiShifer.get('/api-shifer/api/dashboard/raw-materials-stock').then(r => { const v = r.data?.data ?? r.data; return Array.isArray(v) ? v : []; })),
};
