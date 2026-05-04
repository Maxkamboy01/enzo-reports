import axios from 'axios';

// Shifer backend proxied at /api-shifer → https://backend-greymix.bis-apps.com
const api = axios.create({ baseURL: '' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('enzo_token_shifer');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('enzo_token_shifer');
      window.dispatchEvent(new CustomEvent('shifer-auth-error'));
    }
    return Promise.reject(err);
  }
);

const BASE = '/api-shifer/api/dashboardcontrollerm';

const toArr = v => {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.data)) return v.data;
  if (v && Array.isArray(v.items)) return v.items;
  if (v && Array.isArray(v.result)) return v.result;
  return [];
};

// Extract any object (not array) — for overview/totals responses
const toObj = v => {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    if (v.data && typeof v.data === 'object' && !Array.isArray(v.data)) return v.data;
    return v;
  }
  return {};
};

const get = (url, params) => api.get(url, params ? { params } : undefined).then(r => r.data);

export const dashGreymix = {
  overview:               ()  => get(`${BASE}/overview`).then(toObj),
  salesOverview:          p   => get(`${BASE}/sales-overview`, p).then(d => d),
  salesByItems:           p   => get(`${BASE}/sales-by-items`, p).then(toArr),
  salesByCustomer:        p   => get(`${BASE}/sales-by-customer`, p).then(toArr),
  stockLow:               p   => get(`${BASE}/stock-low`, p).then(toArr),
  stockWarehouses:        p   => get(`${BASE}/stock-warehouses`, p).then(toArr),
  stockMovement:          p   => get(`${BASE}/stock-movement`, p).then(toArr),
  accountBalance:         ()  => get(`${BASE}/account-balance`).then(toArr),
  debitorsList:            p   => get(`${BASE}/debitors-list`, p).then(toArr),
  debitorsAging:           p   => get(`${BASE}/debitors-aging`, p).then(toArr),
  debitorsReconciliation:  p   => get(`${BASE}/debitors-reconciliation`, p).then(toArr),
  creditorsList:           p   => get(`${BASE}/creditors-list`, p).then(toArr),
  creditorReconciliation:  p   => get(`${BASE}/creditor-reconciliation`, p).then(toArr),
  incomingPayment:         p   => get(`${BASE}/incoming-payment`, p).then(toArr),
  outgoingPayment:         p   => get(`${BASE}/outgoing-payment`, p).then(toArr),
  pnlSummary:              p   => get(`${BASE}/pnl-summary`, p).then(toArr),
  pnlDetails:              p   => get(`${BASE}/pnl-details`, p).then(toArr),
  expensesList:            p   => get(`${BASE}/expenses-list`, p).then(toArr),
  expensesSummary:         p   => get(`${BASE}/expenses-summary`, p).then(toArr),
  productCostStructure:    p   => get(`${BASE}/cost-structures`, p).then(toArr),
  productCostSummary:      p   => get(`${BASE}/avar-cost-price`, p).then(d => toObj(d)),
};
