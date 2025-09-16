import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Colors, Typography, Spacing, BorderRadius } from '../constants/design';
import { useFavorites } from '../contexts/FavoritesContext';
import { useHistory } from '../contexts/HistoryContext';
import { useCart } from '../contexts/CartContext';
import { Movie, TVShow } from '../types';

const { width, height } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const params = useLocalSearchParams();
  const item = JSON.parse(params.item as string) as Movie | TVShow;
  const type = params.type as 'movie' | 'tv';
  
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToHistory } = useHistory();
  const { addItem } = useCart();
  
  const [isFav, setIsFav] = useState(isFavorite(item.id));
  
  const title = 'title' in item ? item.title : item.name;
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const overview = item.overview || 'Sinopse não disponível.';

  const handleFavorite = () => {
    if (isFav) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
    setIsFav(!isFav);
  };

  const handleWatch = () => {
    addToHistory(item, type);
    Alert.alert(
      'Assistindo!',
      `Você está assistindo ${title}`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleAddToCart = () => {
    addItem({
      movieId: item.id,
      title,
      poster_path: item.poster_path,
      price: type === 'movie' ? 9.99 : 14.99,
      type: 'rent',
      itemType: type,
      fullItem: item,
    });
    
    Alert.alert('Sucesso', `${title} adicionado ao carrinho!`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w1280${item.backdrop_path || item.poster_path}` }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
            style={styles.heroGradient}
          />
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavorite}
            >
              <Ionicons 
                name={isFav ? "heart" : "heart-outline"} 
                size={24} 
                color={isFav ? Colors.cinema.red : "#fff"} 
              />
            </TouchableOpacity>
          </View>

          {/* Movie Info */}
          <View style={styles.movieInfo}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.metaInfo}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={Colors.cinema.gold} />
                <Text style={styles.rating}>{item.vote_average.toFixed(1)}</Text>
              </View>
              {year && (
                <Text style={styles.year}>{year}</Text>
              )}
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {type === 'movie' ? 'FILME' : 'SÉRIE'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.watchButton}
              onPress={handleWatch}
            >
              <LinearGradient
                colors={[Colors.cinema.gold, Colors.cinema.red]}
                style={styles.watchButtonGradient}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.watchButtonText}>Assistir</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={handleAddToCart}
            >
              <LinearGradient
                colors={[Colors.cinema.blue, Colors.cinema.silver]}
                style={styles.cartButtonGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.cartButtonText}>Alugar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text style={styles.synopsis}>{overview}</Text>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Avaliação</Text>
                <Text style={styles.detailValue}>{item.vote_average.toFixed(1)}/10</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ano</Text>
                <Text style={styles.detailValue}>{year}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tipo</Text>
                <Text style={styles.detailValue}>{type === 'movie' ? 'Filme' : 'Série'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Preço</Text>
                <Text style={styles.detailValue}>
                  R$ {type === 'movie' ? '9,99' : '14,99'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cinema.darker,
  },
  heroContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: '#fff',
    marginBottom: Spacing.md,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    marginBottom: Spacing.xs,
  },
  rating: {
    ...Typography.caption,
    color: '#fff',
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  year: {
    ...Typography.body1,
    color: '#fff',
    marginRight: Spacing.md,
    marginBottom: Spacing.xs,
  },
  typeBadge: {
    backgroundColor: Colors.cinema.red,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  typeText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  watchButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  watchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  watchButtonText: {
    ...Typography.button,
    color: '#fff',
    marginLeft: Spacing.sm,
  },
  cartButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  cartButtonText: {
    ...Typography.button,
    color: '#fff',
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: '#fff',
    marginBottom: Spacing.md,
  },
  synopsis: {
    ...Typography.body1,
    color: Colors.neutral[300],
    lineHeight: 24,
  },
  detailsList: {
    backgroundColor: Colors.neutral[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  detailLabel: {
    ...Typography.body2,
    color: Colors.neutral[400],
  },
  detailValue: {
    ...Typography.body2,
    color: '#fff',
    fontWeight: '600',
  },
});

