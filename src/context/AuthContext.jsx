// src/context/AuthContext.jsx - Updated for new backend API
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, setAuthToken, cartAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE_START: 'UPDATE_PROFILE_START',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',
  VERIFY_EMAIL_START: 'VERIFY_EMAIL_START',
  VERIFY_EMAIL_SUCCESS: 'VERIFY_EMAIL_SUCCESS',
  VERIFY_EMAIL_FAILURE: 'VERIFY_EMAIL_FAILURE',
  FORGOT_PASSWORD_START: 'FORGOT_PASSWORD_START',
  FORGOT_PASSWORD_SUCCESS: 'FORGOT_PASSWORD_SUCCESS',
  FORGOT_PASSWORD_FAILURE: 'FORGOT_PASSWORD_FAILURE',
  RESET_PASSWORD_START: 'RESET_PASSWORD_START',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE: 'RESET_PASSWORD_FAILURE',
  CHANGE_PASSWORD_START: 'CHANGE_PASSWORD_START',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_FAILURE: 'CHANGE_PASSWORD_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
    case AUTH_ACTIONS.UPDATE_PROFILE_START:
    case AUTH_ACTIONS.VERIFY_EMAIL_START:
    case AUTH_ACTIONS.FORGOT_PASSWORD_START:
    case AUTH_ACTIONS.RESET_PASSWORD_START:
    case AUTH_ACTIONS.CHANGE_PASSWORD_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        user: action.payload.user || state.user,
        isAuthenticated: action.payload.loggedIn || state.isAuthenticated,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
    case AUTH_ACTIONS.UPDATE_PROFILE_FAILURE:
    case AUTH_ACTIONS.VERIFY_EMAIL_FAILURE:
    case AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE:
    case AUTH_ACTIONS.RESET_PASSWORD_FAILURE:
    case AUTH_ACTIONS.CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        user: action.type.includes('LOAD_USER') ? null : state.user,
        isAuthenticated: action.type.includes('LOAD_USER') ? false : state.isAuthenticated,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS:
    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
    case AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start - ONLY ONCE
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
      
      try {
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        
        if (authToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Set the auth token for API requests
            setAuthToken(authToken);
            
            // Try to validate the session by fetching current profile
            try {
              const profileResponse = await authAPI.getProfile();
              
              // Extract user from response - handle different response structures
              let currentUser = null;
              if (profileResponse.data?.success && profileResponse.data?.data) {
                currentUser = profileResponse.data.data;
              } else if (profileResponse.data?.user) {
                currentUser = profileResponse.data.user;
              } else if (profileResponse.data) {
                currentUser = profileResponse.data;
              } else {
                currentUser = parsedUser; // Fallback to stored data
              }
              
              // Update stored user data if we got fresh data from server
              if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(parsedUser)) {
                localStorage.setItem('user', JSON.stringify(currentUser));
              }
              
              dispatch({
                type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                payload: currentUser,
              });
              
              return;
              
            } catch (profileError) {
              console.warn('⚠️ Could not validate session with server:', profileError.message);
              
              // If profile fetch fails with 401, the token is invalid
              if (profileError.response?.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setAuthToken(null);
                
                dispatch({
                  type: AUTH_ACTIONS.LOAD_USER_FAILURE,
                  payload: null,
                });
                return;
              }
              
              // For other errors (network, server issues), still consider user authenticated
              dispatch({
                type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                payload: parsedUser,
              });
              return;
            }
            
          } catch (parseError) {
            console.error('❌ Error parsing stored user data:', parseError);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            setAuthToken(null);
          }
        }
        
        // No valid session found
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: null,
        });
        
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'Authentication initialization failed',
        });
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - run only once on mount

  // Login function
const login = async (credentials) => {
  dispatch({ type: AUTH_ACTIONS.LOGIN_START });
  
  try {
    const response = await authAPI.login(credentials);
    
    // ✅ FIXED: Handle the actual backend response structure
    let user = null;
    let token = null;
    
    // Backend returns: { message: "Login successful", token: "...", user: {...} }
    if (response.data?.token && response.data?.user) {
      user = response.data.user;
      token = response.data.token;
    } else if (response.data?.data?.token && response.data?.data?.user) {
      // Alternative structure if nested under data
      user = response.data.data.user;
      token = response.data.data.token;
    }
    
    // Validate we got both user and token
    if (!user || !token) {
      console.error('❌ Invalid response structure:', response.data);
      throw new Error('Invalid response from server - missing user or token');
    }
    
    
    // Store authentication data
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthToken(token);
    
    // IMPORTANT: Merge guest cart if exists
    const guestSessionId = localStorage.getItem('sessionId');
    if (guestSessionId) {
      try {
        await cartAPI.mergeGuestCart(guestSessionId);
        localStorage.removeItem('sessionId'); // Clear after merge
      } catch (cartError) {
        console.warn('⚠️ Cart merge failed:', cartError);
        // Don't fail login because of cart merge issues
      }
    }
    
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user },
    });
    
    return { success: true, user };
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    
    // Clear any partial data
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    
    // Extract meaningful error message from backend
    let errorMessage = 'Login failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many login attempts. Please try again later';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your connection';
    }
    
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

  // Register function
// Register function in AuthContext.jsx
const register = async (userData) => {
  dispatch({ type: AUTH_ACTIONS.REGISTER_START });
  
  try {
    // Map frontend fields to backend expected fields
    const backendData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || 'customer',
      company: userData.company,
      address: userData.address
    };
    
    
    const response = await authAPI.register(backendData);
    
    // ✅ FIXED: Handle backend response structure
    if (response.data?.token && response.data?.user) {
      // Auto-login after successful registration
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);
      
      // Merge guest cart if exists
      const guestSessionId = localStorage.getItem('sessionId');
      if (guestSessionId) {
        try {
          await cartAPI.mergeGuestCart(guestSessionId);
          localStorage.removeItem('sessionId');
        } catch (cartError) {
          console.warn('⚠️ Cart merge failed:', cartError);
        }
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user },
      });
      
      return { success: true, user, loggedIn: true };
    }
    
    // Registration successful but no auto-login (email verification required)
    if (response.data?.message) {
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_SUCCESS, 
        payload: { user: null } 
      });
      return { 
        success: true, 
        message: response.data.message,
        requiresVerification: true
      };
    }
    
    throw new Error('Invalid response structure from server');
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    let errorMessage = 'Registration failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMessage = error.response.data.errors.map(err => err.msg || err).join(', ');
    } else if (error.response?.status === 409) {
      errorMessage = 'An account with this email already exists';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Invalid registration data';
    }
    
    dispatch({
      type: AUTH_ACTIONS.REGISTER_FAILURE,
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

  // Logout function
  const logout = async () => {
    
    try {
      // Try to call logout API to invalidate session on server
      await authAPI.logout();
    } catch (error) {
      console.warn('⚠️ Server logout failed (continuing with local logout):', error.message);
    }
    
    // Always clear local storage and state
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId'); // Also clear guest cart session
    setAuthToken(null);
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
  };

  // Update profile function
  const updateProfile = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE_START });
    
    try {
      const response = await authAPI.updateProfile(userData);
      
      let updatedUser = null;
      
      // Handle the new backend response structure
      if (response.data?.success && response.data?.user) {
        updatedUser = response.data.user;
      } else if (response.data?.user) {
        updatedUser = response.data.user;
      } else if (response.data?.data) {
        updatedUser = response.data.data;
      }
      
      if (updatedUser) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
          payload: updatedUser,
        });
        
        return { success: true, user: updatedUser };
      } else {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
          payload: state.user, // Keep existing user data
        });
        return { success: true, message: 'Profile updated successfully' };
      }
      
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Verify email function
// In AuthContext.jsx - verifyEmail function
const verifyEmail = async (token) => {
  dispatch({ type: AUTH_ACTIONS.VERIFY_EMAIL_START });
  
  try {
    // ✅ FIXED: Backend expects POST with token in body
    const response = await authAPI.verifyEmail({ token });
    
    // ✅ FIXED: Handle backend response structure
    // Backend returns: { message: "Email verified successfully" }
    // OR if auto-login: { message: "...", token: "...", user: {...} }
    
    if (response.data?.token && response.data?.user) {
      // Auto-login after verification
      const user = response.data.user;
      const authToken = response.data.token;
      
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(authToken);
      
      // Clear guest cart session
      localStorage.removeItem('sessionId');
      
      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
        payload: { user, loggedIn: true },
      });
      
      return { success: true, user, loggedIn: true };
    }
    
    // Email verified but no auto-login
    dispatch({
      type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
      payload: { loggedIn: false },
    });
    
    return { 
      success: true, 
      message: response.data?.message || 'Email verified successfully'
    };
    
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Email verification failed';
    
    dispatch({
      type: AUTH_ACTIONS.VERIFY_EMAIL_FAILURE,
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

  // Resend verification function
  const resendVerification = async () => {
    
    try {
      const response = await authAPI.resendVerification();
      
      return { 
        success: true, 
        message: response.data?.message || 'Verification email sent'
      };
      
    } catch (error) {
      console.error('❌ Resend verification failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend verification email';
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    dispatch({ type: AUTH_ACTIONS.FORGOT_PASSWORD_START });
    
    try {
      const response = await authAPI.forgotPassword(email);
      
      dispatch({ type: AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS });
      
      return { 
        success: true, 
        message: response.data?.message || 'Password reset instructions sent to your email'
      };
      
    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password reset request failed';
      
      dispatch({
        type: AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_START });
    
    try {
      const response = await authAPI.resetPassword({ token, newPassword });
      
      dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS });
      
      return { 
        success: true, 
        message: response.data?.message || 'Password reset successful'
      };
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      
      dispatch({
        type: AUTH_ACTIONS.RESET_PASSWORD_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    dispatch({ type: AUTH_ACTIONS.CHANGE_PASSWORD_START });
    
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      
      dispatch({ type: AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS });
      
      return { 
        success: true, 
        message: response.data?.message || 'Password changed successfully'
      };
      
    } catch (error) {
      console.error('❌ Password change failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      
      dispatch({
        type: AUTH_ACTIONS.CHANGE_PASSWORD_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Set loading function
  const setLoading = (loading) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading });
  };

  // Get current user profile (refresh from server)
  const refreshProfile = async () => {
    
    try {
      const response = await authAPI.getProfile();
      
      let currentUser = null;
      
      if (response.data?.success && response.data?.data) {
        currentUser = response.data.data;
      } else if (response.data?.user) {
        currentUser = response.data.user;
      } else if (response.data) {
        currentUser = response.data;
      }
      
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
          payload: currentUser,
        });
        
        return { success: true, user: currentUser };
      }
      
      return { success: false, error: 'Invalid profile response' };
      
    } catch (error) {
      console.error('❌ Profile refresh failed:', error);
      
      // If profile refresh fails with 401, the session is invalid
      if (error.response?.status === 401) {
        await logout();
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to refresh profile';
      return { success: false, error: errorMessage };
    }
  };

  // Helper functions
  const hasRole = (role) => {
    if (!state.user) return false;
    const userRoles = Array.isArray(state.user.roles) ? state.user.roles : [state.user.role];
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles) => {
    if (!state.user || !Array.isArray(roles)) return false;
    const userRoles = Array.isArray(state.user.roles) ? state.user.roles : [state.user.role];
    return roles.some(role => userRoles.includes(role));
  };

  const getUserDisplayName = () => {
    if (!state.user) return 'Guest';
    return state.user.firstName || state.user.name || state.user.email || 'User';
  };

  const isEmailVerified = () => {
    return state.user?.isVerified || state.user?.isEmailVerified || false;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshProfile,
    clearError,
    setLoading,
    hasRole,
    hasAnyRole,
    getUserDisplayName,
    isEmailVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
