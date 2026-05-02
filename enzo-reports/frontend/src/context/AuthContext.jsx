import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const DB_META = {
  cement: { token: 'enzo_token',        user: 'enzo_user_cement', label: 'Цемент · Sement',   color: '#1B3A8C', proxyBase: '',           authBase: null },
  shifer: { token: 'enzo_token_shifer', user: 'enzo_user_shifer', label: 'Шифер · Grey Mix',  color: '#059669', proxyBase: '/api-shifer', authBase: null },
  jbi:    { token: 'enzo_token_jbi',    user: 'enzo_user_jbi',    label: 'ЖБИ · Temir Beton', color: '#7C3AED', proxyBase: '/api-jbi',   authBase: '/.netlify/functions/jbi-auth' },
};

function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? null; } catch { return null; }
}

function extractUser(data, fallback) {
  // Case 1: bare string JWT (backend returns just "eyJ...")
  if (typeof data === 'string' && data.length > 20) {
    if (!data.startsWith('eyJ')) return null;
    return { name: fallback, jobTitle: '', employeeCode: fallback, token: data };
  }

  if (!data || typeof data !== 'object') return null;

  // Case 2: { data: "eyJ..." } — data field is the token string itself
  if (typeof data.data === 'string' && data.data.startsWith('eyJ')) {
    return { name: fallback, jobTitle: '', employeeCode: fallback, token: data.data };
  }

  // Case 3: { result: "eyJ..." } or { value: "eyJ..." } or { token: "eyJ..." } at root
  const rootStr = data.result ?? data.value ?? data.token ?? data.Token ?? data.accessToken;
  if (typeof rootStr === 'string' && rootStr.startsWith('eyJ')) {
    return { name: fallback, jobTitle: '', employeeCode: fallback, token: rootStr };
  }

  // Case 4: unwrap one level of { data: { ... } }
  const d = (data.data && typeof data.data === 'object') ? data.data : data;

  const token =
    d.accessToken  ?? d.access_token  ?? d.AccessToken  ??
    d.token        ?? d.Token         ?? d.authToken     ??
    d.jwt          ?? d.JWT           ?? d.bearerToken   ??
    d.BearerToken  ?? d.sessionToken  ?? d.SessionId     ??
    d.jwtToken     ?? d.JwtToken      ?? d.TokenValue    ??
    d.auth_token   ?? d.id_token      ?? d.AuthToken     ??
    d.access       ?? d.result        ?? d.Result        ??
    d.tokenValue   ?? d.bearer        ?? d.Bearer        ??
    d.value        ?? d.Value;

  if (!token || typeof token !== 'string' || !token.startsWith('eyJ')) return null;

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
    const user = extractUser(res.data, body.employeeCode || body.username || body.login || '');
    if (res.status === 200 && !user) {
      console.warn('[auth] 200 but no token extracted from', url, res.data);
    }
    return user;
  } catch {
    return null;
  }
}

// Attempt login on a single backend using all known auth schemas
async function loginToBackend(proxyBase, credentials, authBase = null) {
  const { employeeCode, externalEmployeeNumber, deviceId } = credentials;
  const dev = deviceId || 'web';

  const primary = { employeeCode, externalEmployeeNumber, deviceId: dev };

  // If a dedicated auth endpoint is configured (e.g. Netlify Function), try it first
  if (authBase) {
    const u = await tryAuth(authBase, primary);
    if (u) return u;
    // Alt bodies
    for (const body of [
      { employeeCode, password: externalEmployeeNumber, deviceId: dev },
      { username: employeeCode, password: externalEmployeeNumber, deviceId: dev },
    ]) {
      const u2 = await tryAuth(authBase, body);
      if (u2) return u2;
    }
    return null;
  }

  // Standard proxy path — try common auth endpoints
  const paths = [
    '/api/auth',
    '/api/Auth',
    '/auth',
    '/api/auth/login',
    '/api/Auth/Login',
    '/api/account/login',
    '/api/employees/login',
    '/api/login',
  ];

  for (const path of paths) {
    const u = await tryAuth(`${proxyBase}${path}`, primary);
    if (u) return u;
  }

  // Alt bodies on most likely paths
  for (const body of [
    { employeeCode, password: externalEmployeeNumber, deviceId: dev },
    { username: employeeCode, password: externalEmployeeNumber, deviceId: dev },
  ]) {
    const u = await tryAuth(`${proxyBase}/api/auth`, body);
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
        userObj: await loginToBackend(meta.proxyBase, credentials, meta.authBase),
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

  const setManualToken = useCallback((db, token) => {
    const meta = DB_META[db];
    if (!meta || !token?.trim()) return;
    const trimmed = token.trim().replace(/^Bearer\s+/i, '');
    const fakeUser = { name: db.toUpperCase(), jobTitle: '', employeeCode: db, token: trimmed };
    localStorage.setItem(meta.token, trimmed);
    localStorage.setItem(meta.user, JSON.stringify(fakeUser));
    if (db === 'cement') {
      localStorage.setItem('enzo_token', trimmed);
    }
    // Always set enzo_user so isAuthenticated becomes true
    localStorage.setItem('enzo_user', JSON.stringify(fakeUser));
    setUser(fakeUser);
    setDbTokens(t => ({ ...t, [db]: true }));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, login, logout, clearDbToken, getDbUser, setManualToken,
      dbTokens, DB_META,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
