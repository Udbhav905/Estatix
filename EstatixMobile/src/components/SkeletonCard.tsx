import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function SkeletonCard() {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.3);
  opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.card, { backgroundColor: isDark ? '#2C2A28' : '#E5E3E0' }, animatedStyle]}>
      <View style={[styles.image, { backgroundColor: isDark ? '#3D3A37' : '#D4D2CF' }]} />
      <View style={styles.details}>
        <View style={[styles.line, { width: '80%', height: 16, backgroundColor: isDark ? '#3D3A37' : '#D4D2CF', borderRadius: 8 }]} />
        <View style={[styles.line, { width: '60%', height: 12, marginTop: 8, backgroundColor: isDark ? '#3D3A37' : '#D4D2CF', borderRadius: 6 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 24, overflow: 'hidden' },
  image: { width: width - 32, height: 200 },
  details: { padding: 16 },
  line: { marginVertical: 4 },
});