import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, CartContextType } from '../types';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && items.length >= 0) {
      saveCart();
    }
  }, [items, user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      const cartData = await AsyncStorage.getItem(`cart_${user.id}`);
      if (cartData) {
        setItems(JSON.parse(cartData));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.movieId}-${item.type}-${Date.now()}`,
    };
    
    setItems(prev => {
      // Verificar se o item já existe
      const existingIndex = prev.findIndex(
        existing => existing.movieId === item.movieId && existing.type === item.type
      );
      
      if (existingIndex >= 0) {
        // Se já existe, substituir
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      } else {
        // Se não existe, adicionar
        return [...prev, newItem];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


