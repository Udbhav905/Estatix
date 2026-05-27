import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useFavoriteStore } from '../store/favoriteStore';
import AnimatedHeart from './AnimatedHeart';

const { width } = Dimensions.get('window');

export default function PropertyCard({ property, onPress, index }: any) {
  const { colors, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withTiming(0.96, { duration: 100 }); };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify().damping(12)} style={animatedCardStyle}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.card, { backgroundColor: isDark ? colors.cardBg : colors.cardBg, borderColor: colors.border }]}>
        <Image source={{ uri: property.images[0]?.url || 'https://via.placeholder.com/400' }} style={styles.image} />
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.priceBadge}>
          <Text style={[styles.price, { color: colors.primary }]}>${property.price.toLocaleString()}</Text>
          {property.type === 'RENT' && <Text style={styles.rentText}>/month</Text>}
        </BlurView>
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{property.title}</Text>
            <AnimatedHeart isLiked={isFavorite(property.id)} onPress={() => toggleFavorite(property.id)} />
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={[styles.location, { color: colors.muted }]}>{property.city}, {property.country}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.muted }]}>4.8</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 24, overflow: 'hidden', borderWidth: 0.5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, backgroundColor: 'rgba(255,255,255,0.6)' },
  image: { width: width - 32, height: 200, borderRadius: 20, margin: 0 },
  priceBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold' },
  rentText: { fontSize: 12, marginLeft: 4 },
  details: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  location: { fontSize: 12, marginLeft: 4, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12 },
});