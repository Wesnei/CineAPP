import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing } from '../../constants/design';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

const { width, height } = Dimensions.get('window');

export function Loading({ 
  message = 'Carregando...', 
  fullScreen = false,
  size = 'large' 
}: LoadingProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E', '#FFB3B3']}
          style={styles.fullScreenGradient}
        >
          <View style={styles.fullScreenContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="film" size={48} color="#fff" />
              <Text style={styles.logoText}>CineApp</Text>
            </View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>{message}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary[500]} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullScreenGradient: {
    flex: 1,
  },
  fullScreenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoText: {
    ...Typography.h2,
    color: '#fff',
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: '#fff',
    marginTop: Spacing.md,
    opacity: 0.9,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  message: {
    ...Typography.body2,
    color: Colors.neutral[600],
    marginLeft: Spacing.sm,
  },
});
