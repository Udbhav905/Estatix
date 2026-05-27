import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export default function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onRetry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  message: { fontSize: 16, textAlign: 'center', marginVertical: 12 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});