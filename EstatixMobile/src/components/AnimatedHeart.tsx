import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useHaptic } from '../hooks/useHaptic';

export default function AnimatedHeart({ isLiked, onPress }: { isLiked: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const { colors } = useTheme();
  const { impact } = useHaptic();

  const handlePress = () => {
    impact();
    scale.value = withSequence(
      withSpring(0.8, { damping: 3, stiffness: 200 }),
      withSpring(1.2, { damping: 3, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={animatedStyle}>
        <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={28} color={isLiked ? colors.primary : colors.text} />
      </Animated.View>
    </TouchableOpacity>
  );
}