import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const DB_META = {
  cement: { token: 'enzo_token',        user: 'enzo_user_cement', label: 'Цемент · Sement',   color: '#1B3A8C', proxyBase: '' },
  shifer: { token: 'enzo_token_shifer', user: 'enzo_user_shifer', label: 'Шифер · Grey Mix',  color: '#059669', proxyBase: '/api-shifer' },
  jbi:    { token: 'enzo_token_jbi',    user: 'enzo_user_jbi',    label: 'ЖБИ · Temir Beton', color: '#7C3AED', proxyBase: '/api-jbi' },
};

function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? null; } catch { return null; }
}

function extractUser(data, fallback) {
  const d = data?.data ?? data;
  if (!d) return null;
  const token = d.accessToken ?? d.token ?? d.access_token;
  if (!token) return null;
  return {
    name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.employeeCode || d.name || fallback,
    jobTitle: d.jobTitle || d.position || '',
    employeeCode: d.employeeCode || '',
    token,
  };
}

// Try one auth call — returns user object or null
async function tryAuth(url, body) {
  try {
    const res = await axios.post(url, body, { timeout: 10000 });
    return extractUser(res.data, body.employeeCode || body.username || '');
  } catch {
    return null;
  }
}

// Attempt login on a single backend using all known auth schemas
async function loginToBackend(proxyBase, credentials) {
  const { employeeCode, externalEmployeeNumber, deviceId } = credentials;

  // Schema 1 — Shifer-style: POST /api/auth
  const u1 = await tryAuth(`${proxyBase}/api/auth`, {
    employeeCode,
    externalEmployeeNumber,
    deviceId: deviceId || 'web',
  });
  if (u1) return u1;

  // Schema 2 — try common REST paths with same body
  for (const path of ['/api/auth/login', '/api/employees/login', '/api/account/login']) {
    const u = await tryAuth(`${proxyBase}${path}`, {
      employeeCode,
      externalEmployeeNumber,
      deviceId: deviceId || 'web',
      username: employeeCode,
      password: externalEmployeeNumber,
    });
    if (u) return u;
  }

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    readStore('enzo_user_cement') || readStore('enzo_user')
  );

  const [dbTokens, setDbTokens] = useState(() => ({
    cement: !!localStorage.getItem('enzo_token'),
    shifer: !!localStorage.getItem('enzo_token_shifer'),
    jbi:    !!localStorage.getItem('enzo_token_jbi'),
  }));

  useEffect(() => {
    const onShiferErr = () => {
      localStorage.removeItem(DB_META.shifer.token);
      setDbTokens(t => ({ ...t, shifer: false }));
    };
    window.addEventListener('shifer-auth-error', onShiferErr);
    return () => window.removeEventListener('shifer-auth-error', onShiferErr);
  }, []);

  const login = useCallback(async (credentials) => {
    // Fire at all backends simultaneously
    const results = await Promise.all(
      Object.entries(DB_META).map(async ([db, meta]) => ({
        db,
        userObj: await loginToBackend(meta.proxyBase, credentials),
      }))
    );

    const succeeded = results.filter(r => r.userObj !== null);

    if (succeeded.length === 0) {
      throw new Error('Барча базаларда логин муваффақиятсиз. Маълумотларни текширинг.');
    }

    let primaryUser = null;

    succeeded.forEach(({ db, userObj }) => {
      const meta = DB_META[db];
      localStorage.setItem(meta.token, userObj.token);
      localStorage.setItem(meta.user, JSON.stringify(userObj));
      if (db === 'cement' || !primaryUser) primaryUser = userObj;
    });

    // Legacy key — keeps api.js interceptor working
    localStorage.setItem('enzo_token', primaryUser.token);
    localStorage.setItem('enzo_user', JSON.stringify(primaryUser));
    setUser(primaryUser);

    setDbTokens(prev => {
      const next = { ...prev };
      succeeded.forEach(({ db }) => { next[db] = true; });
      return next;
    });

    return { user: primaryUser, databases: succeeded.map(s => s.db) };
  }, []);

  const clearDbToken = useCallback((db) => {
    const meta = DB_META[db];
    localStorage.removeItem(meta.token);
    localStorage.removeItem(meta.user);
    if (db === 'cement') {
      localStorage.removeItem('enzo_token');
      localStorage.removeItem('enzo_user');
      setUser(null);
    }
    setDbTokens(t => ({ ...t, [db]: false }));
  }, []);

  const logout = useCallback(() => {
    Object.values(DB_META).forEach(m => {
      localStorage.removeItem(m.token);
      localStorage.removeItem(m.user);
    });
    localStorage.removeItem('enzo_token');
    localStorage.removeItem('enzo_user');
    setUser(null);
    setDbTokens({ cement: false, shifer: false, jbi: false });
  }, []);

  const getDbUser = useCallback((db) => readStore(DB_META[db]?.user), []);

  return (
    <AuthContext.Provider value={{
      user, login, logout, clearDbToken, getDbUser,
      dbTokens, DB_META,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
