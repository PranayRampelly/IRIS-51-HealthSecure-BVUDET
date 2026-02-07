import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appointmentService } from '@/services/appointmentService';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'doctor' | 'hospital' | 'admin' | 'bloodbank' | 'insurance' | 'researcher' | 'pharmacy' | 'bioaura';
  token: string;
  hospitalName?: string;
  hospitalType?: string;
  licenseNumber?: string;
  isEmailVerified: boolean;
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Initialize socket connection on app load if token exists
        if (userData.token) {
          appointmentService.initializeSocketAfterLogin(userData.token).catch(error => {
            console.error('Failed to initialize socket on load:', error);
          });
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // Store token separately for API service
    if (userData.token) {
      localStorage.setItem('token', userData.token);

      // Initialize socket connection after successful login
      appointmentService.initializeSocketAfterLogin(userData.token).catch(error => {
        console.error('Failed to initialize socket after login:', error);
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Disconnect socket on logout
    appointmentService.disconnect();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 