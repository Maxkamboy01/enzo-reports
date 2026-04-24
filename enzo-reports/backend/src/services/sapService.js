import axios from 'axios';
import https from 'https';
import { config } from '../config.js';

// SAP B1 Service Layer sessions per DB
const sessions = {};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getSession(db) {
  const dbCfg = config.databases[db];
  if (!dbCfg) throw new Error(`Unknown database: ${db}`);

  // Reuse valid session
  if (sessions[db]?.cookie && sessions[db]?.expiresAt > Date.now()) {
    return sessions[db];
  }

  const res = await axios.post(
    `${dbCfg.url}/Login`,
    { CompanyDB: dbCfg.company, UserName: dbCfg.user, Password: dbCfg.pass },
    { httpsAgent, headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  );

  const cookie = res.headers['set-cookie']?.[0]?.split(';')[0];
  if (!cookie) throw new Error('SAP login failed: no session cookie');

  sessions[db] = { cookie, expiresAt: Date.now() + 25 * 60 * 1000 }; // 25 min
  return sessions[db];
}

export async function sapGet(db, endpoint, params = {}) {
  const { cookie } = await getSession(db);
  const dbCfg = config.databases[db];

  const res = await axios.get(`${dbCfg.url}/${endpoint}`, {
    httpsAgent,
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    params: { $format: 'json', ...params },
    timeout: 30000,
  });

  return res.data.value || res.data;
}

export async function sapQuery(db, query) {
  const { cookie } = await getSession(db);
  const dbCfg = config.databases[db];

  const res = await axios.get(`${dbCfg.url}/SQLQueries('${encodeURIComponent(query)}')/List`, {
    httpsAgent,
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    params: { $format: 'json' },
    timeout: 30000,
  });

  return res.data.value || res.data;
}

// Logout all sessions
export async function logoutAll() {
  for (const [db, session] of Object.entries(sessions)) {
    if (!session?.cookie) continue;
    const dbCfg = config.databases[db];
    try {
      await axios.post(`${dbCfg.url}/Logout`, {}, {
        httpsAgent,
        headers: { Cookie: session.cookie },
        timeout: 5000,
      });
    } catch {}
    delete sessions[db];
  }
}
