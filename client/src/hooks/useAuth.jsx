import { createContext, useContext, useState, useEffect } from 'react';

// Create an auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check localStorage for token
        const token = localStorage.getItem('token');
        
        if (token) {
          // For now, just mock user data based on the token
          // In a real app, you'd fetch this from your API
          const userData = {
            id: '1',
            name: 'Test User',
            email: 'user@example.com',
            role: 'service_owner' // Setting as service_owner for testing
          };
          
          setUser(userData);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate');
        localStorage.removeItem('token');
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
      // Mock successful login
      const data = {
        user: {
          id: '1',
          name: credentials?.email?.split('@')[0] || 'User',
          email: credentials?.email || 'user@example.com',
          role: 'service_owner' // Setting as service_owner for testing
        },
        token: 'mock-jwt-token'
      };
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Set user
      setUser(data.user);
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock successful registration
      const data = {
        user: {
          id: '1',
          name: userData.name,
          email: userData.email,
          role: 'service_owner' // Setting as service_owner for testing
        },
        token: 'mock-jwt-token'
      };
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Set user
      setUser(data.user);
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Get authentication token
  const getToken = () => {
    return localStorage.getItem('token');
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