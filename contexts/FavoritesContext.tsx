import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, TVShow } from '../types';
import { useAuth } from './AuthContext';
import { movieApi } from '../services/movieApi';

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

  const loadFavorites = async () => {
    try {
      const favoriteMovies = await movieApi.getFavoriteMovies();
      setFavorites(favoriteMovies);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    }
  };

  const addToFavorites = async (item: Movie | TVShow) => {
    try {
      const isAlreadyFavorite = favorites.some(fav => fav.id === item.id);
      if (!isAlreadyFavorite) {
        // For movies, use the database toggle
        if ('title' in item) {
          await movieApi.toggleMovieFavorite(item.id);
          await loadFavorites(); // Reload to get updated data
        }
        // Note: TV shows favorite functionality would need to be implemented in database
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  };

  const removeFromFavorites = async (id: number) => {
    try {
      // For movies, use the database toggle
      const movie = favorites.find(fav => fav.id === id && 'title' in fav);
      if (movie) {
        await movieApi.toggleMovieFavorite(id);
        await loadFavorites(); // Reload to get updated data
      }
      // Note: TV shows favorite functionality would need to be implemented in database
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const isFavorite = (id: number) => {
    return favorites.some(fav => fav.id === id);
  };

  const clearFavorites = async () => {
    try {
      // This would need implementation in database service
      setFavorites([]);
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
    }
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
