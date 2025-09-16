import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Toast } from '../../components/ui/Toast';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';
import { useFavorites } from '../../contexts/FavoritesContext';

import { useHistory } from '../../contexts/HistoryContext';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { favorites } = useFavorites();
  const { getWatchedTime, getMoviesWatched, getSeriesWatched } = useHistory();
  const { user } = useAuth();
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const quickActions = [
    {
      title: 'Filmes',
      subtitle: 'Descobrir filmes',
      icon: 'film',
      color: Colors.cinema.red,
      onPress: () => router.push('/(tabs)/movies'),
    },
    {
      title: 'Séries',
      subtitle: 'Bingar séries',
      icon: 'tv',
      color: Colors.cinema.blue,
      onPress: () => router.push('/(tabs)/series'),
    },
    {
      title: 'Favoritos',
      subtitle: 'Seus favoritos',
      icon: 'heart',
      color: Colors.cinema.gold,
      onPress: () => router.push('/(tabs)/favorites'),
    },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.cinema.dark} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.neutral[900]]}
        style={styles.header}
      >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Bem-vindo, {user?.name?.split(' ')[0] || 'Cinéfilo'}!</Text>
                <Text style={styles.subtitle}>O que vamos assistir hoje?</Text>
              </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Em Destaque</Text>
          <View style={styles.featuredCard}>
            <LinearGradient
              colors={[Colors.cinema.red, Colors.cinema.dark]}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredContent}>
                <Ionicons name="star" size={32} color={Colors.cinema.gold} />
                <Text style={styles.featuredTitle}>Filmes Premium</Text>
                <Text style={styles.featuredSubtitle}>
                  Acesse nossa coleção exclusiva de filmes premiados
                </Text>
                <TouchableOpacity 
                  style={styles.featuredButton}
                  onPress={() => router.push('/(tabs)/movies')}
                >
                  <Text style={styles.featuredButtonText}>Explorar</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sua Atividade</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color={Colors.cinema.gold} />
                <Text style={styles.statNumber}>{Math.floor(getWatchedTime() / 60)}</Text>
                <Text style={styles.statLabel}>Horas Assistidas</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="film" size={24} color={Colors.cinema.red} />
                <Text style={styles.statNumber}>{getMoviesWatched()}</Text>
                <Text style={styles.statLabel}>Filmes Assistidos</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="tv" size={24} color={Colors.cinema.blue} />
                <Text style={styles.statNumber}>{getSeriesWatched()}</Text>
                <Text style={styles.statLabel}>Séries Assistidas</Text>
              </View>
            </View>
        </View>
      </ScrollView>
      
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
    paddingTop: 40,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...Typography.h3,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.neutral[300],
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 120, // Space for bottom navigation
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    gap: Spacing.md,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    ...Typography.h6,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  quickActionSubtitle: {
    ...Typography.body2,
    color: Colors.neutral[400],
  },
  featuredCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  featuredGradient: {
    padding: Spacing.xl,
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredTitle: {
    ...Typography.h4,
    color: '#fff',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  featuredSubtitle: {
    ...Typography.body2,
    color: Colors.neutral[300],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  featuredButtonText: {
    ...Typography.button,
    color: '#fff',
    marginRight: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.cinema.gold,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
});