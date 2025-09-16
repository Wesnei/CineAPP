import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, TVShow } from '../types';
import { useAuth } from './AuthContext';

export interface RentalItem {
  id: string;
  movieId: number;
  title: string;
  poster_path: string;
  type: 'movie' | 'tv';
  price: number;
  rentedAt: string;
  expiresAt: string;
  item: Movie | TVShow;
}

interface RentalsContextType {
  rentals: RentalItem[];
  addRental: (item: Movie | TVShow, type: 'movie' | 'tv', price: number) => void;
  removeRental: (id: string) => void;
  isRented: (movieId: number) => boolean;
  clearRentals: () => void;
  getActiveRentals: () => RentalItem[];
  getExpiredRentals: () => RentalItem[];
}

const RentalsContext = createContext<RentalsContextType | undefined>(undefined);

interface RentalsProviderProps {
  children: ReactNode;
}

export function RentalsProvider({ children }: RentalsProviderProps) {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRentals();
    } else {
      setRentals([]);
    }
  }, [user]);

  const getRentalsKey = () => {
    return user ? `rentals_${user.id}` : 'rentals';
  };

  const loadRentals = async () => {
    try {
      const rentalsKey = getRentalsKey();
      const storedRentals = await AsyncStorage.getItem(rentalsKey);
      if (storedRentals) {
        setRentals(JSON.parse(storedRentals));
      } else {
        setRentals([]);
      }
    } catch (error) {
      console.error('Erro ao carregar aluguéis:', error);
    }
  };

  const saveRentals = async (newRentals: RentalItem[]) => {
    try {
      const rentalsKey = getRentalsKey();
      await AsyncStorage.setItem(rentalsKey, JSON.stringify(newRentals));
    } catch (error) {
      console.error('Erro ao salvar aluguéis:', error);
    }
  };

  const addRental = (item: Movie | TVShow, type: 'movie' | 'tv', price: number) => {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours

    const rental: RentalItem = {
      id: `${item.id}-${type}-${Date.now()}`,
      movieId: item.id,
      title: 'title' in item ? item.title : item.name,
      poster_path: item.poster_path,
      type,
      price,
      rentedAt: now.toISOString(),
      expiresAt: expirationDate.toISOString(),
      item
    };

    const newRentals = [...rentals, rental];
    setRentals(newRentals);
    saveRentals(newRentals);
  };

  const removeRental = (id: string) => {
    const newRentals = rentals.filter(rental => rental.id !== id);
    setRentals(newRentals);
    saveRentals(newRentals);
  };

  const isRented = (movieId: number) => {
    const now = new Date();
    return rentals.some(rental => 
      rental.movieId === movieId && 
      new Date(rental.expiresAt) > now
    );
  };

  const clearRentals = () => {
    setRentals([]);
    saveRentals([]);
  };

  const getActiveRentals = () => {
    const now = new Date();
    return rentals.filter(rental => new Date(rental.expiresAt) > now);
  };

  const getExpiredRentals = () => {
    const now = new Date();
    return rentals.filter(rental => new Date(rental.expiresAt) <= now);
  };

  return (
    <RentalsContext.Provider
      value={{
        rentals,
        addRental,
        removeRental,
        isRented,
        clearRentals,
        getActiveRentals,
        getExpiredRentals,
      }}
    >
      {children}
    </RentalsContext.Provider>
  );
}

export function useRentals() {
  const context = useContext(RentalsContext);
  if (context === undefined) {
    throw new Error('useRentals deve ser usado dentro de um RentalsProvider');
  }
  return context;
}