import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { MovieCard } from '../../components/MovieCard';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { Loading } from '../../components/ui/Loading';
import { Toast } from '../../components/ui/Toast';
import { movieApi } from '../../services/movieApi';
import { useCart } from '../../contexts/CartContext';
import { Movie } from '../../types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';

export default function MoviesScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });
  const { addItem } = useCart();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const loadMovies = async () => {
    try {
      const response = await movieApi.getPopularMovies();
      setMovies(response.results);
    } catch (error) {
      showToast('Falha ao carregar filmes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovies();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleMoviePress = (movie: Movie) => {
    router.push({
      pathname: '/movie-details',
      params: { 
        item: JSON.stringify(movie),
        type: 'movie'
      }
    });
  };

  const handleAddToCart = (movie: Movie) => {
    addItem({
      movieId: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      price: 9.99, // Preço mockado
      type: 'rent',
      itemType: 'movie',
      fullItem: movie,
    });
    
    showToast(`${movie.title} adicionado ao carrinho!`, 'success');
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <View style={styles.movieItem}>
      <MovieCard
        item={item}
        onPress={() => handleMoviePress(item)}
        type="movie"
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Alugar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.cinema.dark} />
        <LinearGradient
          colors={[Colors.cinema.dark, Colors.neutral[900]]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Filmes Populares</Text>
          <Text style={styles.headerSubtitle}>
            Os melhores filmes para você assistir
          </Text>
        </LinearGradient>
        
        <View style={styles.skeletonContainer}>
          <SkeletonCard count={6} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.cinema.dark} />
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.neutral[900]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Filmes Populares</Text>
        <Text style={styles.headerSubtitle}>
          Os melhores filmes para você assistir
        </Text>
      </LinearGradient>

      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.cinema.gold]}
            tintColor={Colors.cinema.gold}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cinema.darker,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerTitle: {
    ...Typography.h2,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: '#fff',
    opacity: 0.9,
  },
  listContainer: {
    padding: Spacing.md,
    paddingBottom: 120, // Space for bottom navigation
  },
  row: {
    justifyContent: 'space-between',
  },
  movieItem: {
    marginBottom: Spacing.md,
  },
  addButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  addButtonText: {
    color: '#fff',
    ...Typography.caption,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  skeletonContainer: {
    flex: 1,
    padding: Spacing.md,
  },
});
