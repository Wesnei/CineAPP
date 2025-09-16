import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSQLiteDatabase } from '../hooks/useSQLiteDatabase';
import { sqliteTestService } from '../services/sqliteTest';
import { Movie } from '../types';

export function SQLiteExample() {
  const {
    status,
    searchContent,
    toggleMovieFavorite,
    getFavoriteMovies,
    getSearchHistory,
    clearSearchHistory,
    refreshStats
  } = useSQLiteDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    movies: Movie[];
    tvShows: any[];
    total: number;
  } | null>(null);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    if (status.isInitialized) {
      loadData();
    }
  }, [status.isInitialized]);

  const loadData = async () => {
    try {
      const [favorites, history] = await Promise.all([
        getFavoriteMovies(),
        getSearchHistory()
      ]);
      setFavoriteMovies(favorites);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await searchContent({ query: searchQuery });
      setSearchResults(results);
      
      // Refresh search history
      const history = await getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar conteúdo');
    }
  };

  const handleToggleFavorite = async (movieId: number) => {
    try {
      await toggleMovieFavorite(movieId);
      
      // Refresh favorites and stats
      const favorites = await getFavoriteMovies();
      setFavoriteMovies(favorites);
      refreshStats();
      
      Alert.alert('Sucesso', 'Favorito atualizado!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar favorito');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setSearchHistory([]);
      Alert.alert('Sucesso', 'Histórico de busca limpo!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao limpar histórico');
    }
  };

  const runTests = async () => {
    try {
      const results = await sqliteTestService.runTests();
      setTestResults(results.results);
      
      if (!results.success) {
        Alert.alert('Testes', `Alguns testes falharam:\n${results.errors.join('\n')}`);
      } else {
        Alert.alert('Testes', 'Todos os testes passaram!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao executar testes');
    }
  };

  if (status.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Inicializando SQLite...</Text>
      </View>
    );
  }

  if (status.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro SQLite</Text>
        <Text style={styles.error}>{status.error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SQLite Database Example</Text>
      
      {/* Database Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status do Banco</Text>
        <Text style={styles.statusText}>
          ✅ Inicializado: {status.isInitialized ? 'Sim' : 'Não'}
        </Text>
        {status.stats && (
          <Text style={styles.statusText}>
            📊 Filmes: {status.stats.moviesCount} | Séries: {status.stats.tvShowsCount} | Gêneros: {status.stats.genresCount}
          </Text>
        )}
      </View>

      {/* Search */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buscar Conteúdo</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Digite sua busca..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        
        {searchResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Resultados: {searchResults.total} itens encontrados
            </Text>
            {searchResults.movies.map(movie => (
              <View key={movie.id} style={styles.movieItem}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.movieRating}>⭐ {movie.vote_average}</Text>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleToggleFavorite(movie.id)}
                >
                  <Text style={styles.favoriteButtonText}>
                    {favoriteMovies.some(fav => fav.id === movie.id) ? '❤️ Favorito' : '🤍 Favoritar'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Favorites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filmes Favoritos ({favoriteMovies.length})</Text>
        {favoriteMovies.map(movie => (
          <View key={movie.id} style={styles.favoriteItem}>
            <Text style={styles.favoriteTitle}>{movie.title}</Text>
            <Text style={styles.favoriteRating}>⭐ {movie.vote_average}</Text>
          </View>
        ))}
      </View>

      {/* Search History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Histórico de Busca</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
        {searchHistory.map((query, index) => (
          <Text key={index} style={styles.historyItem}>• {query}</Text>
        ))}
      </View>

      {/* Tests */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.testButton} onPress={runTests}>
          <Text style={styles.testButtonText}>Executar Testes SQLite</Text>
        </TouchableOpacity>
        
        {testResults.length > 0 && (
          <View style={styles.testResults}>
            <Text style={styles.testResultsTitle}>Resultados dos Testes:</Text>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.testResult}>{result}</Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  movieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  movieTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  movieRating: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  favoriteButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  favoriteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    marginBottom: 4,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteRating: {
    fontSize: 14,
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testResults: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  testResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testResult: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 16,
  },
});