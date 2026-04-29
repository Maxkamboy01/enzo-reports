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

  // Inventory
  inventoryTransfer:         list('/api-jbi/api/dashboard/inventory-transfer-request'),
};
