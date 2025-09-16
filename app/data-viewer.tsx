import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../constants/design';
import { databaseService } from '../services/database';
import { useSQLiteDatabase } from '../hooks/useSQLiteDatabase';

interface DatabaseTableData {
  movies: any[];
  tvShows: any[];
  genres: any[];
  users: any[];
  searchHistory: any[];
}

export default function DataViewerScreen() {
  const { status } = useSQLiteDatabase();
  const [tableData, setTableData] = useState<DatabaseTableData>({
    movies: [],
    tvShows: [],
    genres: [],
    users: [],
    searchHistory: []
  });
  const [activeTab, setActiveTab] = useState<keyof DatabaseTableData>('movies');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status.isInitialized) {
      loadAllData();
    }
  }, [status.isInitialized]);

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      
      // Get database stats
      const stats = await databaseService.getDatabaseStats();
      
      // Load data from each table
      const [movies, tvShows, genres, searchHistory] = await Promise.all([
        loadMovies(),
        loadTVShows(),
        loadGenres(),
        loadSearchHistory(),
      ]);

      setTableData({
        movies,
        tvShows,
        genres,
        users: [], // We'll add this if needed
        searchHistory
      });

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do banco');
    } finally {
      setRefreshing(false);
    }
  };

  const loadMovies = async () => {
    try {
      const movies = await databaseService.getPopularMovies(100);
      return movies;
    } catch (error) {
      console.error('Error loading movies:', error);
      return [];
    }
  };

  const loadTVShows = async () => {
    try {
      const tvShows = await databaseService.getPopularTVShows(100);
      return tvShows;
    } catch (error) {
      console.error('Error loading TV shows:', error);
      return [];
    }
  };

  const loadGenres = async () => {
    try {
      const genres = await databaseService.getGenres();
      return genres;
    } catch (error) {
      console.error('Error loading genres:', error);
      return [];
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await databaseService.getSearchHistory();
      return history.map((query, index) => ({ id: index, query }));
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    await loadAllData();
  };

  const clearTable = async (tableName: keyof DatabaseTableData) => {
    Alert.alert(
      'Limpar Tabela',
      `Deseja limpar todos os dados da tabela "${tableName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              if (tableName === 'searchHistory') {
                await databaseService.clearSearchHistory();
              } else {
                // Add other clear methods as needed
                Alert.alert('Info', 'Função de limpeza não implementada para esta tabela');
                return;
              }
              await loadAllData();
              Alert.alert('Sucesso', 'Tabela limpa com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar tabela');
            }
          }
        },
      ]
    );
  };

  const renderMoviesData = () => (
    <ScrollView style={styles.tableContainer}>
      {tableData.movies.map((movie, index) => (
        <View key={movie.id} style={styles.dataRow}>
          <Text style={styles.dataTitle}>#{movie.id} - {movie.title}</Text>
          <Text style={styles.dataField}>Avaliação: {movie.vote_average}</Text>
          <Text style={styles.dataField}>Ano: {movie.release_date?.split('-')[0] || 'N/A'}</Text>
          <Text style={styles.dataField}>Favorito: {movie.isFavorite ? 'Sim' : 'Não'}</Text>
          <Text style={styles.dataField}>Assistido: {movie.isWatched ? 'Sim' : 'Não'}</Text>
          <Text style={styles.dataField}>Alugado: {movie.isRented ? 'Sim' : 'Não'}</Text>
          <Text style={styles.dataFieldSmall}>Criado: {new Date(movie.createdAt).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderTVShowsData = () => (
    <ScrollView style={styles.tableContainer}>
      {tableData.tvShows.map((show, index) => (
        <View key={show.id} style={styles.dataRow}>
          <Text style={styles.dataTitle}>#{show.id} - {show.name}</Text>
          <Text style={styles.dataField}>Avaliação: {show.vote_average}</Text>
          <Text style={styles.dataField}>Ano: {show.first_air_date?.split('-')[0] || 'N/A'}</Text>
          <Text style={styles.dataField}>Favorito: {show.isFavorite ? 'Sim' : 'Não'}</Text>
          <Text style={styles.dataField}>Assistido: {show.isWatched ? 'Sim' : 'Não'}</Text>
          <Text style={styles.dataField}>Alugado: {show.isRented ? 'Sim' : 'Não'}</Text>
          <Text style={styles.dataFieldSmall}>Criado: {new Date(show.createdAt).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderGenresData = () => (
    <ScrollView style={styles.tableContainer}>
      {tableData.genres.map((genre, index) => (
        <View key={genre.id} style={styles.dataRow}>
          <Text style={styles.dataTitle}>#{genre.id} - {genre.name}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderSearchHistoryData = () => (
    <ScrollView style={styles.tableContainer}>
      {tableData.searchHistory.map((item, index) => (
        <View key={index} style={styles.dataRow}>
          <Text style={styles.dataTitle}>Busca #{index + 1}</Text>
          <Text style={styles.dataField}>Query: "{item}"</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="server-outline" size={64} color={Colors.neutral[400]} />
      <Text style={styles.emptyTitle}>Nenhum dado encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Esta tabela está vazia ou ainda não foi inicializada
      </Text>
    </View>
  );

  const renderTableContent = () => {
    const currentData = tableData[activeTab];
    
    if (!Array.isArray(currentData) || currentData.length === 0) {
      return renderEmptyState();
    }

    switch (activeTab) {
      case 'movies':
        return renderMoviesData();
      case 'tvShows':
        return renderTVShowsData();
      case 'genres':
        return renderGenresData();
      case 'searchHistory':
        return renderSearchHistoryData();
      default:
        return renderEmptyState();
    }
  };

  const getTabTitle = (tab: keyof DatabaseTableData) => {
    const counts = {
      movies: tableData.movies.length,
      tvShows: tableData.tvShows.length,
      genres: tableData.genres.length,
      users: tableData.users.length,
      searchHistory: tableData.searchHistory.length,
    };

    const titles = {
      movies: `Filmes (${counts.movies})`,
      tvShows: `Séries (${counts.tvShows})`,
      genres: `Gêneros (${counts.genres})`,
      users: `Usuários (${counts.users})`,
      searchHistory: `Histórico (${counts.searchHistory})`,
    };

    return titles[tab];
  };

  if (!status.isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {status.isLoading ? 'Inicializando banco de dados...' : 'Banco não inicializado'}
          </Text>
          {status.error && (
            <Text style={styles.errorText}>{status.error}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.cinema.darker]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.cinema.gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visualizar Dados SQLite</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color={Colors.cinema.gold} />
          </TouchableOpacity>
        </View>

        {status.stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              📊 Total: {status.stats.moviesCount + status.stats.tvShowsCount} itens | 
              🎬 {status.stats.moviesCount} filmes | 
              📺 {status.stats.tvShowsCount} séries | 
              🏷️ {status.stats.genresCount} gêneros
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView 
        horizontal 
        style={styles.tabScrollView} 
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.tabContainer}>
          {(Object.keys(tableData) as (keyof DatabaseTableData)[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {getTabTitle(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>
            {getTabTitle(activeTab)}
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => clearTable(activeTab)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.cinema.red} />
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.dataContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.cinema.gold]}
              tintColor={Colors.cinema.gold}
            />
          }
        >
          {renderTableContent()}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cinema.darker,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.cinema.gold,
    textAlign: 'center',
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  statsText: {
    ...Typography.caption,
    color: Colors.neutral[300],
    textAlign: 'center',
  },
  tabScrollView: {
    backgroundColor: Colors.neutral[900],
    maxHeight: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeTab: {
    backgroundColor: Colors.cinema.gold,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.neutral[300],
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.cinema.dark,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableTitle: {
    ...Typography.h4,
    color: '#fff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,20,60,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    ...Typography.caption,
    color: Colors.cinema.red,
    marginLeft: 4,
  },
  dataContainer: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
  },
  dataRow: {
    backgroundColor: Colors.neutral[900],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  dataTitle: {
    ...Typography.h6,
    color: '#fff',
    marginBottom: 8,
  },
  dataField: {
    ...Typography.body2,
    color: Colors.neutral[300],
    marginBottom: 4,
  },
  dataFieldSmall: {
    ...Typography.caption,
    color: Colors.neutral[400],
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.neutral[300],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body1,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    ...Typography.h4,
    color: Colors.neutral[300],
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.cinema.red,
    textAlign: 'center',
  },
});