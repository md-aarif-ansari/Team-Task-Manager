import React, { createContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, onTokenChange, setToken as persistToken } from '../auth/token';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());

  const isLoggedIn = useMemo(() => !!token, [token]);

  const login = (token) => {
    persistToken(token);
    setToken(token);
  };

  const logout = () => {
    clearToken();
    setToken(null);
  };

  useEffect(() => {
    return onTokenChange((nextToken) => {
      setToken(nextToken);
    })
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
