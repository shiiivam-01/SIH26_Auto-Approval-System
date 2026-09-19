import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
    setToken(null);
    setUser(null);
  }, [queryClient]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        if (storedToken.includes('simulated_signature')) {
          // Immediately purge old simulated token
          logout();
        } else {
          const decoded = jwtDecode(storedToken);
          // Check expiry (exp is in seconds)
          if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch {
        logout();
      }
    } else {
      logout();
    }
    setLoading(false);

    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [logout]);

  const loginAuth = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginAuth, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
