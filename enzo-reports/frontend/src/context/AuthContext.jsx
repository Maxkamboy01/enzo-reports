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
  // Unwrap one level of { data: ... } if present
  const d = (data?.data && typeof data.data === 'object') ? data.data : data;
  if (!d || typeof d !== 'object') return null;
  // Try every common token field name across different backend conventions
  const token =
    d.accessToken  ?? d.access_token  ?? d.AccessToken  ??
    d.token        ?? d.Token         ?? d.authToken     ??
    d.jwt          ?? d.JWT           ?? d.bearerToken   ??
    d.BearerToken  ?? d.sessionToken  ?? d.SessionId     ??
    d.jwtToken     ?? d.JwtToken      ?? d.TokenValue    ??
    d.auth_token   ?? d.id_token;
  if (!token || typeof token !== 'string') return null;
  return {
    name: `${d.firstName || d.FirstName || ''} ${d.lastName || d.LastName || ''}`.trim()
          || d.fullName || d.FullName || d.name || d.Name
          || d.employeeCode || d.username || d.userName || fallback,
    jobTitle: d.jobTitle || d.JobTitle || d.position || d.Position || '',
    employeeCode: d.employeeCode || d.EmployeeCode || d.username || d.userName || '',
    token,
  };
}

// Try one auth call — returns user object or null
async function tryAuth(url, body) {
  try {
    const res = await axios.post(url, body, { timeout: 8000 });
    return extractUser(res.data, body.employeeCode || body.username || body.login || '');
  } catch {
    return null;
  }
}

// Attempt login on a single backend using all known auth schemas
async function loginToBackend(proxyBase, credentials) {
  const { employeeCode, externalEmployeeNumber, deviceId } = credentials;
  const dev = deviceId || 'web';

  // Primary attempt — Shifer/JBI style (proven to work on Shifer)
  const primaryBody = { employeeCode, externalEmployeeNumber, deviceId: dev };
  const u1 = await tryAuth(`${proxyBase}/api/auth`, primaryBody);
  if (u1) return u1;

  // Alternative body shapes some SAP B1 wrappers use
  const altBodies = [
    { employeeCode, password: externalEmployeeNumber, deviceId: dev },
    { username: employeeCode, password: externalEmployeeNumber, deviceId: dev },
    { username: employeeCode, externalEmployeeNumber, deviceId: dev },
  ];

  for (const body of altBodies) {
    const u = await tryAuth(`${proxyBase}/api/auth`, body);
    if (u) return u;
  }

  // Try secondary endpoint paths with the original body
  for (const path of ['/api/auth/login', '/api/account/login', '/api/employees/login']) {
    const u = await tryAuth(`${proxyBase}${path}`, primaryBody);
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
    const onJbiErr = () => {
      localStorage.removeItem(DB_META.jbi.token);
      setDbTokens(t => ({ ...t, jbi: false }));
    };
    window.addEventListener('shifer-auth-error', onShiferErr);
    window.addEventListener('jbi-auth-error', onJbiErr);
    return () => {
      window.removeEventListener('shifer-auth-error', onShiferErr);
      window.removeEventListener('jbi-auth-error', onJbiErr);
    };
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

    // Clear ALL previous tokens before writing new ones — prevents stale
    // session tokens from a different DB bleeding into this login
    Object.values(DB_META).forEach(m => {
      localStorage.removeItem(m.token);
      localStorage.removeItem(m.user);
    });
    localStorage.removeItem('enzo_token');
    localStorage.removeItem('enzo_user');

    let primaryUser = null;

    succeeded.forEach(({ db, userObj }) => {
      const meta = DB_META[db];
      localStorage.setItem(meta.token, userObj.token);
      localStorage.setItem(meta.user, JSON.stringify(userObj));
      if (db === 'cement' || !primaryUser) primaryUser = userObj;
    });

    // Legacy enzo_token is ONLY written when cement succeeded (it drives api.js
    // interceptor for cement requests). For JBI/Shifer-only logins this key stays
    // empty so dbTokens.cement stays false on the next refresh.
    const cementUser = succeeded.find(s => s.db === 'cement')?.userObj;
    if (cementUser) {
      localStorage.setItem('enzo_token', cementUser.token);
    }
    // enzo_user provides isAuthenticated on refresh regardless of which DB
    localStorage.setItem('enzo_user', JSON.stringify(primaryUser));
    setUser(primaryUser);

    // Hard-reset ALL db flags, then only raise the ones that succeeded
    setDbTokens({
      cement: false,
      shifer: false,
      jbi:    false,
      ...Object.fromEntries(succeeded.map(s => [s.db, true])),
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
