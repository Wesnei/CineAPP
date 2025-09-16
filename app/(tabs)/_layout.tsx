import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, Typography, Spacing } from '@/constants/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components/ui/Loading';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { items } = useCart();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('login' as any);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.cinema.gold,
        tabBarInactiveTintColor: Colors.neutral[400],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.cinema.dark,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[800],
          paddingTop: Spacing.md,
          paddingBottom: Spacing.lg,
          paddingHorizontal: Spacing.sm,
          height: 85,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Filmes',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons 
                name={focused ? "film" : "film-outline"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="series"
        options={{
          title: 'Séries',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons 
                name={focused ? "tv" : "tv-outline"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons 
                name={focused ? "heart" : "heart-outline"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', position: 'relative' }}>
              <Ionicons 
                name={focused ? "cart" : "cart-outline"} 
                size={24} 
                color={color} 
              />
              {items.length > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -6,
                  right: -10,
                  backgroundColor: Colors.cinema.red,
                  borderRadius: 12,
                  minWidth: 22,
                  height: 22,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: Colors.cinema.dark,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                    {items.length > 99 ? '99+' : items.length}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
