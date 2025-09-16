import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { movieApi } from '../services/movieApi';
import { databaseService } from '../services/database';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database first
      await movieApi.initializeApp();
      // Then load user
      await loadUser();
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Try to find user in database
      const dbUser = await databaseService.getUserByEmail(email);
      
      if (dbUser && dbUser.password === password) {
        // User found and password matches
        const userToSave = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(userToSave));
        setUser(userToSave);
        return true;
      } else {
        // For demo purposes, accept any email/password combination if user doesn't exist
        const newUser: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
        };
        
        // Save to database
        await databaseService.createUser(newUser.id, newUser.name, newUser.email, password);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if user already exists
      const existingUser = await databaseService.getUserByEmail(email);
      if (existingUser) {
        console.error('User already exists with this email');
        return false;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
      };
      
      // Save to database
      await databaseService.createUser(newUser.id, newUser.name, newUser.email, password);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}