
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMe } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    // 1️⃣ Restore user immediately (fast UI)
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2️⃣ Validate token with backend
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data)); // ✅ persist
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
