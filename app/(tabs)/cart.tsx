import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useCart } from '../../contexts/CartContext';
import { useRentals } from '../../contexts/RentalsContext';
import { CartItem } from '../../types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';

export default function CartScreen() {
  const { items, removeItem, clearCart, total } = useCart();
  const { addRental } = useRentals();

  const handleRemoveItem = (itemId: string, itemTitle: string) => {
    Alert.alert(
      'Remover item',
      `Deseja remover "${itemTitle}" do carrinho?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    
    Alert.alert(
      'Limpar carrinho',
      'Deseja remover todos os itens do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleRent = () => {
    if (items.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de alugar.');
      return;
    }
    
    Alert.alert(
      'Confirmar Aluguel',
      `Total: R$ ${total.toFixed(2)}\n\nDeseja prosseguir com o aluguel?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Alugar', 
          onPress: () => {
            // Add all items to rentals
            items.forEach(cartItem => {
              if (cartItem.fullItem) {
                addRental(cartItem.fullItem, cartItem.itemType, cartItem.price);
              } else {
                // Fallback for items without fullItem
                const mockItem = {
                  id: parseInt(cartItem.movieId.toString()),
                  title: cartItem.title,
                  name: cartItem.title,
                  poster_path: cartItem.poster_path,
                  overview: '',
                  backdrop_path: '',
                  vote_average: 0,
                  vote_count: 0,
                  genre_ids: [],
                  adult: false,
                  original_language: 'en',
                  original_title: cartItem.title,
                  original_name: cartItem.title,
                  popularity: 0
                } as any;
                
                addRental(mockItem, cartItem.itemType || 'movie', cartItem.price);
              }
            });
            
            clearCart();
            Alert.alert(
              'Aluguel Confirmado!', 
              `${items.length} ${items.length === 1 ? 'item alugado' : 'itens alugados'} com sucesso! Você pode assistir por 48 horas.`,
              [
                {
                  text: 'Ver Aluguéis',
                  onPress: () => router.push('/rentals' as any)
                },
                {
                  text: 'OK',
                  onPress: () => router.push('/(tabs)/movies')
                }
              ]
            );
          }
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemType}>
          {item.type === 'rent' ? 'Aluguel' : 'Compra'}
        </Text>
        <Text style={styles.itemPrice}>
          R$ {item.price.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id, item.title)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
      <Text style={styles.emptySubtitle}>
        Adicione filmes e séries ao carrinho para começar
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.cinema.dark, Colors.neutral[900]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <Text style={styles.headerSubtitle}>
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </Text>
      </LinearGradient>

      {items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCart}
              >
                <LinearGradient
                  colors={['rgba(220, 20, 60, 0.1)', 'rgba(220, 20, 60, 0.2)']}
                  style={styles.clearButtonGradient}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.cinema.red} />
                  <Text style={styles.clearButtonText}>Limpar</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleRent}
              >
                <LinearGradient
                  colors={[Colors.cinema.gold, Colors.cinema.red]}
                  style={styles.checkoutGradient}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.checkoutButtonText}>Alugar Agora</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </>
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
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    padding: 16,
    paddingBottom: 160, 
  },
  cartItem: {
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
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
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
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    ...Typography.h6,
    color: Colors.cinema.gold,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 85, 
    left: 0,
    right: 0,
    backgroundColor: Colors.neutral[900],
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[800],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    ...Typography.h5,
    color: '#fff',
  },
  totalValue: {
    ...Typography.h4,
    color: Colors.cinema.gold,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  clearButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cinema.red,
  },
  clearButtonText: {
    color: Colors.cinema.red,
    ...Typography.button,
    marginLeft: Spacing.xs,
  },
  checkoutButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  checkoutButtonText: {
    color: '#fff',
    ...Typography.button,
    marginLeft: Spacing.sm,
  },
});
