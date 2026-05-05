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
