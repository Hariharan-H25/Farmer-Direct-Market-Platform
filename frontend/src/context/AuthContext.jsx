import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signOut } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync state if localStorage changes across tabs or windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profile') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fc:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fc:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback((authData) => {
    if (!authData) return;
    localStorage.setItem('profile', JSON.stringify(authData));
    setUser(authData);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fc:login', { detail: authData }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // Clear local session regardless of server state
    }
    // Deep cache purge across user sessions to prevent any cross-account data leakage
    localStorage.removeItem('profile');
    localStorage.removeItem('cart');
    localStorage.removeItem('fc_selected_address');
    localStorage.removeItem('fc_saved_addresses');
    try {
      sessionStorage.clear();
    } catch (_) {}
    setUser(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fc:logout'));
    }
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prev => {
      if (!prev) return null;
      const newProfile = {
        ...prev,
        result: {
          ...(prev.result || {}),
          ...updatedUserData
        }
      };
      localStorage.setItem('profile', JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const token = user?.token || null;
  const userResult = user?.result || user || null;
  const role = userResult?.role || 'customer';
  const isVerified = userResult?.isVerified ?? true;
  const isAuthenticated = !!token && !!userResult;

  return (
    <AuthContext.Provider
      value={{
        user,
        userResult,
        token,
        role,
        isVerified,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser
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
