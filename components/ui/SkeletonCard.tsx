import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius } from '../../constants/design';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const SkeletonItem = () => (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, shimmerStyle]}>
        <LinearGradient
          colors={[Colors.neutral[200], Colors.neutral[300], Colors.neutral[200]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.imageSkeleton}
        />
      </Animated.View>
      
      <View style={styles.content}>
        <Animated.View style={[styles.titleSkeleton, shimmerStyle]}>
          <LinearGradient
            colors={[Colors.neutral[200], Colors.neutral[300], Colors.neutral[200]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleLine}
          />
        </Animated.View>
        
        <Animated.View style={[styles.subtitleSkeleton, shimmerStyle]}>
          <LinearGradient
            colors={[Colors.neutral[200], Colors.neutral[300], Colors.neutral[200]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subtitleLine}
          />
        </Animated.View>
      </View>
    </View>
  );

  if (count === 1) {
    return <SkeletonItem />;
  }

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imageSkeleton: {
    width: '100%',
    height: cardWidth * 1.5,
  },
  content: {
    paddingHorizontal: Spacing.xs,
  },
  titleSkeleton: {
    marginBottom: Spacing.xs,
  },
  titleLine: {
    height: 16,
    borderRadius: BorderRadius.xs,
  },
  subtitleSkeleton: {
    marginBottom: Spacing.xs,
  },
  subtitleLine: {
    height: 12,
    width: '60%',
    borderRadius: BorderRadius.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
});
