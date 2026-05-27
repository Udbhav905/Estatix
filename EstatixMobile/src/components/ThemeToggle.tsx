import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useHaptic } from '../hooks/useHaptic';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { impact } = useHaptic();
  const handlePress = () => {
    impact();
    toggleTheme();
  };
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ container: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)' } });