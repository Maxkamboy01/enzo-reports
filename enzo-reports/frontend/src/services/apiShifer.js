import axios from 'axios';

// All /api-shifer/* calls are proxied to http://backend-greymix.bis-apps.com
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

// Param mapper — Shifer uses camelCase startDate/endDate
const p = ({ dateFrom, dateTo, itemCode, whsCode, pageSize, skip } = {}) => ({
  startDate:  dateFrom,
  endDate:    dateTo,
  ...(itemCode  ? { itemCode }  : {}),
  ...(whsCode   ? { whsCode }   : {}),
  ...(pageSize != null ? { pageSize } : {}),
  ...(skip     != null ? { skip }     : {}),
});

const list = url => params =>
  apiShifer.get(url, { params: p(params) }).then(r => r.data?.data ?? r.data ?? []);

export const dashShifer = {
  productionPerformReports: list('/api-shifer/api/dashboard/production-perform-reports'),
  issueItemMetaterials:     list('/api-shifer/api/dashboard/issue-item-metaterials'),
};
