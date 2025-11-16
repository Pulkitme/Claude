/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authApi } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user data from backend
   */
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const response = await authApi.getMe();
      return response.data || null;
    } catch (err: any) {
      // If user doesn't exist in backend, return null
      // This will trigger registration flow
      console.log('User not found in backend:', err.message);
      return null;
    }
  };

  /**
   * Listen to Firebase auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Login with email and password
   */
  const login = async ({ email, password }: LoginCredentials) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(userCredential.user);

      if (!userData) {
        throw new Error('User account not found. Please register first.');
      }

      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async ({ email, password, displayName }: RegisterData) => {
    try {
      setError(null);
      setLoading(true);

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Register in backend
      const response = await authApi.register(
        userCredential.user.uid,
        email,
        displayName
      );

      setUser(response.data?.user || null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to logout';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
