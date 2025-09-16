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
import { useRentals } from '../contexts/RentalsContext';

export default function RentalsScreen() {
  const { getActiveRentals, getExpiredRentals, removeRental } = useRentals();
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  
  const activeRentals = getActiveRentals();
  const expiredRentals = getExpiredRentals();

  const handleRemoveRental = (id: string, title: string) => {
    Alert.alert(
      'Remover Aluguel',
      `Deseja remover "${title}" dos seus aluguéis?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeRental(id) },
      ]
    );
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m restantes`;
    } else if (diffMins > 0) {
      return `${diffMins}m restantes`;
    }
    return 'Expirado';
  };

  const renderRentalItem = (rental: any) => (
    <View key={rental.id} style={styles.rentalCard}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${rental.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.rentalInfo}>
        <Text style={styles.rentalTitle} numberOfLines={2}>
          {rental.title}
        </Text>
        <Text style={styles.rentalType}>
          {rental.type === 'movie' ? '🎬 Filme' : '📺 Série'}
        </Text>
        <Text style={styles.rentalPrice}>
          R$ {rental.price.toFixed(2)}
        </Text>
        {activeTab === 'active' ? (
          <Text style={styles.timeRemaining}>
            ⏰ {formatTimeRemaining(rental.expiresAt)}
          </Text>
        ) : (
          <Text style={styles.expiredText}>
            ❌ Expirado em {new Date(rental.expiresAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveRental(rental.id, rental.title)}
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
          <Text style={styles.headerTitle}>Meus Aluguéis</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Ativos ({activeRentals.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
            onPress={() => setActiveTab('expired')}
          >
            <Text style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>
              Expirados ({expiredRentals.length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          activeRentals.length > 0 ? (
            activeRentals.map(renderRentalItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={64} color={Colors.neutral[400]} />
              <Text style={styles.emptyTitle}>Nenhum aluguel ativo</Text>
              <Text style={styles.emptySubtitle}>
                Que tal alugar um filme ou série?
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/movies')}
              >
                <Text style={styles.exploreButtonText}>Explorar Conteúdo</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          expiredRentals.length > 0 ? (
            expiredRentals.map(renderRentalItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.neutral[400]} />
              <Text style={styles.emptyTitle}>Nenhum aluguel expirado</Text>
              <Text style={styles.emptySubtitle}>
                Todos os seus aluguéis estão ativos!
              </Text>
            </View>
          )
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
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.cinema.gold,
  },
  tabText: {
    ...Typography.body2,
    color: Colors.neutral[300],
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.cinema.dark,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  rentalCard: {
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
  rentalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rentalTitle: {
    ...Typography.h4,
    color: '#fff',
    marginBottom: 4,
  },
  rentalType: {
    ...Typography.body2,
    color: Colors.neutral[400],
    marginBottom: 4,
  },
  rentalPrice: {
    ...Typography.body2,
    color: Colors.cinema.gold,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeRemaining: {
    ...Typography.caption,
    color: Colors.success,
  },
  expiredText: {
    ...Typography.caption,
    color: Colors.cinema.red,
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