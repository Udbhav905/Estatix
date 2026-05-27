import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors } = useTheme();
  const { impact } = useHaptic();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    impact();
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred during login';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
        <Text style={[styles.title, { color: colors.primary }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Sign in to your account</Text>
        
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
        
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} disabled={loading}>
          <Text style={[styles.forgot, { color: colors.primary }]}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={[styles.link, { color: colors.text }]}>Don't have an account? <Text style={{ color: colors.primary }}>Sign Up</Text></Text>
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
  forgot: { textAlign: 'right', marginBottom: 24 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', fontSize: 14 },
});