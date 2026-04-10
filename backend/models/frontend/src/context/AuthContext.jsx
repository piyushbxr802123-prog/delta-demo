import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from local storage
  useEffect(() => {
    const checkLogged = async () => {
      const storedUser = localStorage.getItem('messpay_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // We could also verify token with backend here
      }
      setLoading(false);
    };
    checkLogged();
  }, []);

  const login = async (rollNumber, password) => {
    const res = await axios.post('http://localhost:4005/api/auth/login', { rollNumber, password });
    setUser(res.data);
    localStorage.setItem('messpay_user', JSON.stringify(res.data));
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('http://localhost:4005/api/auth/register', userData);
    setUser(res.data);
    localStorage.setItem('messpay_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('messpay_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
