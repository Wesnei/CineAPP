import { useState, useEffect } from 'react';
import { movieApi } from '../services/movieApi';
import { databaseService, SearchFilters } from '../services/database';
import { Movie, TVShow } from '../types';

export interface DatabaseStatus {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  stats: {
    moviesCount: number;
    tvShowsCount: number;
    genresCount: number;
  } | null;
}

export function useSQLiteDatabase() {
  const [status, setStatus] = useState<DatabaseStatus>({
    isInitialized: false,
    isLoading: true,
    error: null,
    stats: null
  });

  // Initialize database when hook is first used
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      await movieApi.initializeApp();
      const stats = await databaseService.getDatabaseStats();
      
      setStatus({
        isInitialized: true,
        isLoading: false,
        error: null,
        stats
      });
      
      console.log('✅ SQLite database initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize database';
      setStatus({
        isInitialized: false,
        isLoading: false,
        error: errorMessage,
        stats: null
      });
      
      console.error('❌ Database initialization failed:', error);
    }
  };

  const searchContent = async (filters: SearchFilters) => {
    try {
      if (!status.isInitialized) {
        throw new Error('Database not initialized');
      }
      return await movieApi.searchContent(filters);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  const toggleMovieFavorite = async (movieId: number) => {
    try {
      if (!status.isInitialized) {
        throw new Error('Database not initialized');
      }
      return await movieApi.toggleMovieFavorite(movieId);
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw error;
    }
  };

  const getFavoriteMovies = async (): Promise<Movie[]> => {
    try {
      if (!status.isInitialized) {
        throw new Error('Database not initialized');
      }
      return await movieApi.getFavoriteMovies();
    } catch (error) {
      console.error('Get favorites error:', error);
      return [];
    }
  };

  const getSearchHistory = async (): Promise<string[]> => {
    try {
      if (!status.isInitialized) {
        return [];
      }
      return await movieApi.getSearchHistory();
    } catch (error) {
      console.error('Get search history error:', error);
      return [];
    }
  };

  const clearSearchHistory = async (): Promise<void> => {
    try {
      if (!status.isInitialized) {
        throw new Error('Database not initialized');
      }
      await movieApi.clearSearchHistory();
    } catch (error) {
      console.error('Clear search history error:', error);
      throw error;
    }
  };

  const refreshStats = async () => {
    try {
      if (!status.isInitialized) {
        return;
      }
      const stats = await databaseService.getDatabaseStats();
      setStatus(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Refresh stats error:', error);
    }
  };

  return {
    status,
    initializeDatabase,
    searchContent,
    toggleMovieFavorite,
    getFavoriteMovies,
    getSearchHistory,
    clearSearchHistory,
    refreshStats
  };
}