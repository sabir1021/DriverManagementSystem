import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/supabase';

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const signIn = async (email, password) => {
    try {
      // Don't dispatch SET_LOADING here to avoid re-renders
      const { user } = await authService.signIn(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      return { success: true };
    } catch (error) {
      // Don't dispatch SET_LOADING on error to avoid clearing error messages
      
      console.log('Login error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'no_code',
        status: error?.status || 'no_status',
        originalError: error?.originalError || error
      });
      
      let errorMessage = 'An unexpected error occurred during login.';
      
      // Check for email confirmation errors using the error code we saw in the network tab
      if (error?.code === 'email_not_confirmed' || 
          error?.originalError?.code === 'email_not_confirmed' ||
          error?.message?.toLowerCase().includes('email not confirmed') || 
          error?.message?.toLowerCase().includes('email_not_confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in. If you don\'t see the email, check your spam folder.';
      } 
      // Check for invalid credentials
      else if (error?.message?.toLowerCase().includes('invalid login credentials') ||
               error?.message?.toLowerCase().includes('invalid_credentials') ||
               error?.code === 'invalid_credentials') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } 
      // Check for rate limiting
      else if (error?.message?.toLowerCase().includes('too many requests') ||
               error?.message?.toLowerCase().includes('rate limit')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      }
      // Use the original error message if we have one
      else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.log('Final error message:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user } = await authService.signUp(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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