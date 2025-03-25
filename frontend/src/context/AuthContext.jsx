import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Criando o contexto
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se já existe um token salvo ao iniciar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  // Função para realizar login
  async function login(email, password) {
    try {
      setLoading(true);
      const response = await api.post('/api/users/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  }

  // Função para registrar novo usuário
  async function register(username, email, password) {
    try {
      setLoading(true);
      const response = await api.post('/api/users/register', { 
        username, 
        email, 
        password 
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao registrar usuário' 
      };
    } finally {
      setLoading(false);
    }
  }

  // Função para realizar logout
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete api.defaults.headers.Authorization;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        loading, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para facilitar o uso do contexto
export function useAuth() {
  return useContext(AuthContext);
}