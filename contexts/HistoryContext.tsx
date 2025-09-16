import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, TVShow } from '../types';
import { useAuth } from './AuthContext';

interface HistoryItem {
  id: number;
  title: string;
  poster_path: string;
  type: 'movie' | 'tv';
  watchedAt: string;
  duration?: number; // em minutos
}

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
  removeFromHistory: (id: number) => void;
  clearHistory: () => void;
  getWatchedTime: () => number; // retorna tempo total assistido em minutos
  getMoviesWatched: () => number;
  getSeriesWatched: () => number;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

interface HistoryProviderProps {
  children: ReactNode;
}

export function HistoryProvider({ children }: HistoryProviderProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const historyKey = user ? `history_${user.id}` : 'history';
      const storedHistory = await AsyncStorage.getItem(historyKey);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      const historyKey = user ? `history_${user.id}` : 'history';
      await AsyncStorage.setItem(historyKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const addToHistory = (item: Movie | TVShow, type: 'movie' | 'tv') => {
    const historyItem: HistoryItem = {
      id: item.id,
      title: 'title' in item ? item.title : item.name,
      poster_path: item.poster_path,
      type,
      watchedAt: new Date().toISOString(),
      duration: type === 'movie' ? 120 : 45, // Duração mockada
    };

    // Remove se já existe (para atualizar a data)
    const filteredHistory = history.filter(h => h.id !== item.id);
    const newHistory = [historyItem, ...filteredHistory]; // Sem limite de itens
    
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const removeFromHistory = (id: number) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const getWatchedTime = () => {
    return history.reduce((total, item) => total + (item.duration || 0), 0);
  };

  const getMoviesWatched = () => {
    return history.filter(item => item.type === 'movie').length;
  };

  const getSeriesWatched = () => {
    return history.filter(item => item.type === 'tv').length;
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getWatchedTime,
        getMoviesWatched,
        getSeriesWatched,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory deve ser usado dentro de um HistoryProvider');
  }
  return context;
}
