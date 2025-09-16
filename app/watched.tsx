import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../constants/design';
import { useHistory } from '../contexts/HistoryContext';

export default function WatchedScreen() {
  const { history, removeFromHistory, clearHistory, getWatchedTime, getMoviesWatched, getSeriesWatched } = useHistory();
  const [filter, setFilter] = useState<'all' | 'movies' | 'tv'>('all');

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.type === 'movie';
    if (filter === 'tv') return item.type === 'tv';
    return false;
  });

  const handleRemoveFromHistory = (id: number, title: string) => {
    Alert.alert(
      'Remover do Histórico',
      `Deseja remover "${title}" do seu histórico?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeFromHistory(id) },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Deseja remover todo o histórico de visualização?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const formatWatchedDate = (watchedAt: string) => {
    const date = new Date(watchedAt);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getFilterCount = (type: 'all' | 'movies' | 'tv') => {
    if (type === 'all') return history.length;
    if (type === 'movies') return getMoviesWatched();
    return getSeriesWatched();
  };

  const renderHistoryItem = (item: any) => (
    <View key={`${item.id}-${item.watchedAt}`} style={styles.historyCard}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.historyType}>
          {item.type === 'movie' ? '🎬 Filme' : '📺 Série'}
        </Text>
        <Text style={styles.watchedDate}>
          📅 Assistido em {formatWatchedDate(item.watchedAt)}
        </Text>
        {item.duration && (
          <Text style={styles.duration}>
            ⏱️ {item.duration} minutos
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromHistory(item.id, item.title)}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.cinema.red} />
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.headerTitle}>Histórico</Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.cinema.red} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              Todos ({getFilterCount('all')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'movies' && styles.activeFilter]}
            onPress={() => setFilter('movies')}
          >
            <Text style={[styles.filterText, filter === 'movies' && styles.activeFilterText]}>
              Filmes ({getFilterCount('movies')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'tv' && styles.activeFilter]}
            onPress={() => setFilter('tv')}
          >
            <Text style={[styles.filterText, filter === 'tv' && styles.activeFilterText]}>
              Séries ({getFilterCount('tv')})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredHistory.length > 0 ? (
          filteredHistory.map(renderHistoryItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={filter === 'movies' ? 'film-outline' : filter === 'tv' ? 'tv-outline' : 'time-outline'} 
              size={64} 
              color={Colors.neutral[400]} 
            />
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'Nenhum conteúdo assistido' : 
               filter === 'movies' ? 'Nenhum filme assistido' : 
               'Nenhuma série assistida'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' ? 'Comece assistindo algo!' : 
               filter === 'movies' ? 'Que tal assistir um filme?' : 
               'Que tal assistir uma série?'}
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push(filter === 'tv' ? '/(tabs)/series' : '/(tabs)/movies')}
            >
              <Text style={styles.exploreButtonText}>
                {filter === 'tv' ? 'Ver Séries' : 'Ver Filmes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 20,
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
    ...Typography.h2,
    color: Colors.cinema.gold,
    textAlign: 'center',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220,20,60,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    ...Typography.body1,
    color: Colors.cinema.gold,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsRow: {
    alignItems: 'center',
  },
  statsText: {
    ...Typography.body2,
    color: Colors.neutral[300],
    textAlign: 'center',
    marginBottom: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: Colors.cinema.gold,
  },
  filterText: {
    ...Typography.body2,
    color: Colors.neutral[300],
    fontWeight: '600',
  },
  activeFilterText: {
    color: Colors.cinema.dark,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[900],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  historyTitle: {
    ...Typography.h4,
    color: '#fff',
    marginBottom: 4,
  },
  historyType: {
    ...Typography.body2,
    color: Colors.neutral[400],
    marginBottom: 4,
  },
  watchedDate: {
    ...Typography.caption,
    color: Colors.cinema.gold,
    marginBottom: 2,
  },
  duration: {
    ...Typography.caption,
    color: Colors.neutral[400],
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...Typography.h3,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body1,
    color: Colors.neutral[400],
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: Colors.cinema.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    ...Typography.body2,
    color: Colors.cinema.dark,
    fontWeight: '600',
  },
});