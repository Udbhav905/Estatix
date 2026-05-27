import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import api from '../../api/client';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { impact } = useHaptic();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    impact();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Success', 'Reset link sent to your email');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
        <Text style={[styles.title, { color: colors.primary }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>We'll send you a link to reset your password</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleReset} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: colors.text }]}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  form: { width: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  input: { borderWidth: 0.5, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', fontSize: 14 },
});