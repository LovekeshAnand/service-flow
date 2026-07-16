import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create an auth context
const AuthContext = createContext();

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + "/api/v1";

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedProfile = localStorage.getItem('profile');
        
        if (token && storedProfile && storedProfile !== 'undefined' && storedProfile !== 'null') {
          setUser(JSON.parse(storedProfile));
        }
      } catch (err) {
        console.error('Authentication error on initial load:', err);
        setError('Failed to authenticate');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('profile');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
      
      const responseData = response.data?.data;
      if (response.data && responseData) {
        const accessToken = responseData.accessToken || responseData.token;
        const profileData = responseData.user || responseData.service;
        
        if (!accessToken) {
          throw new Error('Access token is missing from the response.');
        }

        if (responseData.service && profileData) {
          profileData.isService = true;
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('profile', JSON.stringify(profileData));
        setUser(profileData);
        
        return { success: true, user: profileData };
      } else {
        throw new Error('Invalid response structure from server.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (formData, type = 'user') => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'user' ? '/users/register' : '/services/register';
      const headers = type === 'service' ? { 'Content-Type': 'multipart/form-data' } : {};
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, { headers });
      const responseData = response.data?.data;
      
      if (response.data && responseData) {
        const accessToken = responseData.accessToken || responseData.token;
        const profileData = responseData.user || responseData.service;
        
        if (type === 'service' && profileData) {
          profileData.isService = true;
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (profileData) {
          localStorage.setItem('profile', JSON.stringify(profileData));
          setUser(profileData);
        }
        
        return { success: true, user: profileData };
      } else {
        throw new Error('Invalid response structure from server.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    const token = localStorage.getItem('accessToken');
    const isService = user && (user.isService || user.serviceName || user.service_name);
    const endpoint = isService ? '/services/logout' : '/users/logout';
    
    try {
      if (token) {
        await axios.post(
          `${API_BASE_URL}${endpoint}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch (err) {
      console.error('API logout request failed:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('profile');
      setUser(null);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Get authentication token
  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Provide auth context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    getToken,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};