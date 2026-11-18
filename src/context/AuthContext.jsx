import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rinnovo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('rinnovo_token') || null);
  const [loading, setLoading] = useState(false);

  // Sincronizar token en axios client
  useEffect(() => {
    if (token) {
      localStorage.setItem('rinnovo_token', token);
    } else {
      localStorage.removeItem('rinnovo_token');
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      const receivedToken = data.access_token || data.token;
      const receivedUser = data.user;

      if (!receivedToken || !receivedUser) {
        throw new Error('Respuesta inválida del servidor');
      }

      localStorage.setItem('rinnovo_token', receivedToken);
      localStorage.setItem('rinnovo_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return {
        success: true,
        user: receivedUser,
        isAdmin: receivedUser.role === 'admin' || receivedUser.is_admin === true,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors?.email?.[0]) ||
        'Error de autenticación. Verifique sus credenciales.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch {
      // Ignorar si el token ya expiró en backend
    } finally {
      localStorage.removeItem('rinnovo_token');
      localStorage.removeItem('rinnovo_user');
      localStorage.removeItem('rinnovo_cart');
      localStorage.removeItem('rinnovo_active_order');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin' || user?.is_admin === true,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
