import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { colors } = useTheme();
  const { impact } = useHaptic();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    impact();
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred during registration';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
        <Text style={[styles.title, { color: colors.primary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Sign up to get started</Text>
        
        <TextInput 
          style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} 
          placeholder="Full Name" 
          placeholderTextColor={colors.muted} 
          value={name} 
          onChangeText={setName} 
          editable={!loading}
        />
        
        <TextInput 
          style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} 
          placeholder="Email" 
          placeholderTextColor={colors.muted} 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address"
          editable={!loading}
        />
        
        <View style={[styles.passwordContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <TextInput 
            style={[styles.passwordInput, { color: colors.text }]} 
            placeholder="Password" 
            placeholderTextColor={colors.muted} 
            secureTextEntry={!showPassword} 
            value={password} 
            onChangeText={setPassword} 
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.passwordContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <TextInput 
            style={[styles.passwordInput, { color: colors.text }]} 
            placeholder="Confirm Password" 
            placeholderTextColor={colors.muted} 
            secureTextEntry={!showPassword} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            editable={!loading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
          onPress={handleRegister} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={[styles.link, { color: colors.text }]}>Already have an account? <Text style={{ color: colors.primary }}>Login</Text></Text>
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
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderRadius: 12, paddingHorizontal: 14, marginBottom: 16 },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', fontSize: 14 },
});