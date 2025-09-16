import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useHistory } from '../../contexts/HistoryContext';
import { useRentals } from '../../contexts/RentalsContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { favorites, clearFavorites } = useFavorites();
  const { history, clearHistory, getWatchedTime, getMoviesWatched, getSeriesWatched } = useHistory();
  const { getActiveRentals, getExpiredRentals } = useRentals();
  const { user, logout } = useAuth();
  
  const activeRentals = getActiveRentals();
  const expiredRentals = getExpiredRentals();
  const totalRentals = activeRentals.length + expiredRentals.length;

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('login' as any);
          }
        },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      'Limpar Favoritos',
      'Deseja remover todos os favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearFavorites },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Deseja remover todo o histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'heart-outline',
      title: 'Meus Favoritos',
      subtitle: `${favorites.length} ${favorites.length === 1 ? 'filme/série favorito' : 'filmes/séries favoritos'}`,
      color: Colors.cinema.red,
      onPress: () => router.push('/(tabs)/favorites'),
    },
    {
      icon: 'time-outline',
      title: 'Histórico de Visualização',
      subtitle: `${history.length} ${history.length === 1 ? 'item assistido' : 'itens assistidos'}`,
      color: Colors.cinema.gold,
      onPress: () => router.push('/watched' as any),
    },
    {
      icon: 'cart-outline',
      title: 'Meus Aluguéis',
      subtitle: `${activeRentals.length} ${activeRentals.length === 1 ? 'ativo' : 'ativos'}, ${totalRentals} total`,
      color: Colors.cinema.blue,
      onPress: () => router.push('/rentals' as any),
    },
    {
      icon: 'log-out-outline',
      title: 'Sair da Conta',
      subtitle: 'Desconectar do CineApp',
      color: Colors.cinema.red,
      onPress: handleLogout,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.neutral[900]]}
        style={styles.header}
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={Colors.cinema.gold} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Cinéfilo'} ! </Text>
          <Text style={styles.userEmail}>🎬 Amante de Cinema 🍿</Text>
        </View>
      </LinearGradient>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        ))}

      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CineApp v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cinema.darker,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  menuContainer: {
    padding: 16,
    paddingBottom: 120, 
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[900],
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.neutral[400],
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.neutral[400],
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
});

