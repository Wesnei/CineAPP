import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { MovieCard } from '../../components/MovieCard';
import { movieApi } from '../../services/movieApi';
import { useCart } from '../../contexts/CartContext';
import { TVShow } from '../../types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';

export default function SeriesScreen() {
  const [series, setSeries] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addItem } = useCart();

  const loadSeries = async () => {
    try {
      const response = await movieApi.getPopularTVShows();
      setSeries(response.results);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar séries');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSeries();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleSeriesPress = (tvShow: TVShow) => {
    router.push({
      pathname: '/movie-details',
      params: { 
        item: JSON.stringify(tvShow),
        type: 'tv'
      }
    });
  };

  const handleAddToCart = (tvShow: TVShow) => {
    addItem({
      movieId: tvShow.id,
      title: tvShow.name,
      poster_path: tvShow.poster_path,
      price: 14.99, 
      type: 'rent',
      itemType: 'tv',
      fullItem: tvShow,
    });
    
    Alert.alert('Sucesso', `${tvShow.name} adicionada ao carrinho!`);
  };

  const renderSeries = ({ item }: { item: TVShow }) => (
    <View style={styles.seriesItem}>
      <MovieCard
        item={item}
        onPress={() => handleSeriesPress(item)}
        type="tv"
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <LinearGradient
          colors={[Colors.cinema.blue, Colors.cinema.silver]}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Assinar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.cinema.dark, Colors.neutral[900]]}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>Carregando séries...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.neutral[900]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Séries Populares</Text>
        <Text style={styles.headerSubtitle}>
          As melhores séries para maratonar
        </Text>
      </LinearGradient>

      <FlatList
        data={series}
        renderItem={renderSeries}
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
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120, 
  },
  row: {
    justifyContent: 'space-between',
  },
  seriesItem: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
