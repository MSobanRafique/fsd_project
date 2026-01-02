// Authentication Context
// Person 1 - Frontend Team
// Manages authentication state across the application

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Verify token is still the same before fetching user (prevent multi-tab issues)
          const currentToken = localStorage.getItem('token');
          if (currentToken !== token) {
            // Token changed, don't proceed
            setLoading(false);
            return;
          }

          // Always fetch fresh user data from backend to ensure role is correct
          const response = await api.get('/auth/me');
          
          // Verify token still matches (prevent state corruption from multiple tabs)
          const verifyToken = localStorage.getItem('token');
          if (verifyToken !== token) {
            // Token changed during fetch, don't update user
            setLoading(false);
            return;
          }

          // Verify user ID matches token (prevent user state corruption)
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            if (response.data._id !== decoded.id) {
              console.error('User ID mismatch detected - token and user data do not match');
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
              setLoading(false);
              return;
            }
          } catch (decodeError) {
            console.error('Token decode error:', decodeError);
          }

          // Ensure we're using the role from the response, not cached data
          setUser({
            _id: response.data._id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role, // Always use role from backend
            phone: response.data.phone,
            address: response.data.address,
            profilePic: response.data.profilePic
          });
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set user data with role from backend response
      const user = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role, // Use role directly from backend
        phone: userData.phone || '',
        address: userData.address || '',
        profilePic: userData.profilePic || ''
      };
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set user data with role from backend response
      const newUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Use role directly from backend
        phone: user.phone || '',
        address: user.address || '',
        profilePic: user.profilePic || ''
      };
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout(); // Logout after account deletion
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete account' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      };
    }
  };

  const refreshUser = async () => {
    if (!token) {
      return { success: false };
    }

    try {
      // Verify token is still valid before refreshing
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        // Token has changed, don't refresh
        return { success: false };
      }

      // Fetch fresh user data from backend
      const response = await api.get('/auth/me');
      
      // Verify the user ID matches the token (prevent user state corruption)
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (response.data._id !== decoded.id) {
        console.error('User ID mismatch - token and user data do not match');
        return { success: false };
      }
      
      // Update user state with fresh data, ensuring role is from backend
      setUser({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role, // Always use role from backend
        phone: response.data.phone || '',
        address: response.data.address || '',
        profilePic: response.data.profilePic || ''
      });
      
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Refresh user error:', error);
      // Only clear token if it's an authentication error
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      return { success: false };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    changePassword,
    refreshUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

