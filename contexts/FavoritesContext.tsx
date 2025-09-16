import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, TVShow } from '../types';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: (Movie | TVShow)[];
  addToFavorites: (item: Movie | TVShow) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<(Movie | TVShow)[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const getFavoritesKey = () => {
    return user ? `favorites_${user.id}` : 'favorites';
  };

  const loadFavorites = async () => {
    try {
      const favoritesKey = getFavoritesKey();
      const storedFavorites = await AsyncStorage.getItem(favoritesKey);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const saveFavorites = async (newFavorites: (Movie | TVShow)[]) => {
    try {
      const favoritesKey = getFavoritesKey();
      await AsyncStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const addToFavorites = (item: Movie | TVShow) => {
    const isAlreadyFavorite = favorites.some(fav => fav.id === item.id);
    if (!isAlreadyFavorite) {
      const newFavorites = [...favorites, item];
      setFavorites(newFavorites);
      saveFavorites(newFavorites);
    }
  };

  const removeFromFavorites = (id: number) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (id: number) => {
    return favorites.some(fav => fav.id === id);
  };

  const clearFavorites = () => {
    setFavorites([]);
    saveFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
}
