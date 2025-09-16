import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useFavorites } from '../../contexts/FavoritesContext';
import { useHistory } from '../../contexts/HistoryContext';

import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';
import { Movie, TVShow } from '../../types';

export default function FavoritesScreen() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToHistory } = useHistory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simula refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRemoveFavorite = (id: number, title: string) => {
    Alert.alert(
      'Remover dos Favoritos',
      `Deseja remover "${title}" dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeFromFavorites(id) },
      ]
    );
  };

  const handleClearFavorites = () => {
    if (favorites.length === 0) return;
    
    Alert.alert(
      'Limpar Favoritos',
      'Deseja remover todos os itens dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearFavorites },
      ]
    );
  };

  const handleWatch = (item: Movie | TVShow) => {
    const type = 'title' in item ? 'movie' : 'tv';
    addToHistory(item, type);
    Alert.alert(
      'Assistindo!',
      `Você está assistindo ${'title' in item ? item.title : item.name}`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/movies')
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: Movie | TVShow }) => (
    <View style={styles.favoriteItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {'title' in item ? item.title : item.name}
        </Text>
        <Text style={styles.itemType}>
          {'title' in item ? 'Filme' : 'Série'}
        </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => handleWatch(item)}
          >
            <LinearGradient
              colors={[Colors.cinema.gold, Colors.cinema.red]}
              style={styles.watchButtonGradient}
            >
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={styles.watchButtonText}>Assistir</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item.id, 'title' in item ? item.title : item.name)}
          >
            <Ionicons name="heart" size={20} color={Colors.cinema.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyFavorites = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={Colors.neutral[400]} />
      <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
      <Text style={styles.emptySubtitle}>
        Adicione filmes e séries aos favoritos para vê-los aqui
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/movies')}
      >
        <LinearGradient
          colors={[Colors.cinema.blue, Colors.cinema.red]}
          style={styles.exploreButtonGradient}
        >
          <Ionicons name="film" size={20} color="#fff" />
          <Text style={styles.exploreButtonText}>Explorar Filmes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.neutral[900]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Meus Favoritos</Text>
            <Text style={styles.headerSubtitle}>
              {favorites.length} {favorites.length === 1 ? 'item' : 'itens'} favoritos
            </Text>
          </View>
          {favorites.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFavorites}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.cinema.red} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {favorites.length === 0 ? (
        renderEmptyFavorites()
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
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
      )}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: 120, // Space for bottom navigation
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  itemImage: {
    width: 80,
    height: 120,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    ...Typography.h6,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  itemType: {
    ...Typography.caption,
    color: Colors.neutral[400],
    marginBottom: Spacing.md,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watchButton: {
    flex: 1,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  watchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  watchButtonText: {
    ...Typography.caption,
    color: '#fff',
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  removeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.neutral[300],
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body2,
    color: Colors.neutral[400],
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  exploreButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  exploreButtonText: {
    ...Typography.button,
    color: '#fff',
    marginLeft: Spacing.sm,
  },
});
