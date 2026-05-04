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

const p = ({ dateFrom, dateTo, pageSize, skip } = {}) => ({
  StartDate: dateFrom,
  EndDate: dateTo,
  ...(pageSize != null ? { pageSize } : {}),
  ...(skip != null ? { skip } : {}),
});

const list = url => params =>
  api.get(url, { params: p(params) }).then(r => r.data?.data ?? r.data ?? []);

export const dash = {
  // Production
  millProduction:            list('/api/dashboard/mill-production'),
  volumeDaily:               list('/api/dashboard/volume-daily'),
  shiftPerformance:          list('/api/dashboard/shift-performance'),

  // Raw materials
  rawMaterialsStock:         () => api.get('/api/dashboard/raw-materials-stock').then(r => r.data?.data ?? r.data ?? []),
  rawMaterialReceipt:        list('/api/dashboard/raw-material-receipt'),
  rawMaterialConsumption:    list('/api/dashboard/raw-material-consumption'),
  rawMaterialMovement:       list('/api/dashboard/raw-material-movement'),
  rawMaterialPivot:          list('/api/dashboard/raw-material-pivot'),
  materialVsBom:             list('/api/dashboard/material-vs-bom'),
  materialOverconsumption:   list('/api/dashboard/material-overconsumption'),
  materialConsumptionShift:  list('/api/dashboard/material-consumption-shift'),

  // Silo & Cement
  siloStock:                 () => api.get('/api/dashboard/silo-stock').then(r => r.data?.data ?? r.data ?? []),
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
};

export const fmt = n => {
  const num = parseFloat(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString('ru-RU');
};

export const fmtFull = n => (parseFloat(n) || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 });

export const fmtN = (n, d = 2) => (parseFloat(n) || 0).toLocaleString('ru-RU', { maximumFractionDigits: d, minimumFractionDigits: d });
