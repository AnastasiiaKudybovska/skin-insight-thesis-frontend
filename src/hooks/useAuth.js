import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStyledSnackbar from './useStyledSnackbar';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useStyledSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleApiError = (error) => {
    if (error.detail) {
      if (error.detail === "Email not registered") return 'email_not_registered';
      if (error.detail === "Invalid email or password") return 'invalid_credentials';
      if (error.detail === "Email already registered") return 'email_exists';
      if (error.detail === "Invalid token") return 'invalid_token';
      return error.detail;
    }
    
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'unknown_error';
  };

  const storeTokens = (data) => {
    if (data.access_token) localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
  };

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('diagnostic_mode');
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/signin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      setUser(data);
      storeTokens(data);
      showSuccess('login_success');
      navigate(location.state?.from === '/diagnostics?mode=research' ? location.state.from : '/diagnostics');
      return data;
    } catch (error) {
      const errorKey = handleApiError(error);
      showError(errorKey);
      throw errorKey;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      showSuccess('registration_success');
      navigate('/login');
      return data;
    } catch (error) {
      const errorKey = handleApiError(error);
      showError(errorKey);
      throw errorKey;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('invalid_token');
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/logout`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (response.status === 401) {
        throw new Error('invalid_token');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Logout failed');
      }

      setUser(null);
      clearTokens();
      showSuccess('logout_success');
      navigate('/login');
    } catch (error) {
      const errorKey = handleApiError(error);
      if (errorKey === 'invalid_token') {
        setUser(null);
        clearTokens();
        navigate('/login');
      } else {
        showError(errorKey);
      }
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.status === 401) {
        clearTokens();
        return null;
      }

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      }
      
      clearTokens();
      return null;
    } catch (error) {
      clearTokens();
      return null;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated: !!localStorage.getItem('access_token'),
  };
};
