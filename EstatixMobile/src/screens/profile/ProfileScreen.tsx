import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useFavoriteStore } from '../../store/favoriteStore';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/ThemeToggle';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { loadFavorites } = useFavoriteStore();
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout() },
    ]);
  };

  // 1. Open gallery – NO crop, just pick
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,      // ❌ No crop screen
      quality: 0.8,
    });
    if (!result.canceled) {
      setTempAvatarUri(result.assets[0].uri);
    }
  };

  // 2. Refresh user data from backend after upload
  const refreshUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      const updatedUser = res.data.user;
      useAuthStore.setState({ user: updatedUser });
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  };

  // 3. Upload the selected image
  const uploadAvatar = async () => {
    if (!tempAvatarUri) return;
    setUploading(true);
    const filename = tempAvatarUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('avatar', {
      uri: tempAvatarUri,
      name: filename,
      type,
    } as any);

    try {
      await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUserData();
      Alert.alert('Success', 'Avatar updated!');
      setTempAvatarUri(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setTempAvatarUri(null);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.header}>
        {/* Avatar with click handler */}
        <TouchableOpacity onPress={pickAvatar}>
          <Image
            source={{ uri: tempAvatarUri || user?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>
        <ThemeToggle />

        {/* Save/Cancel buttons only when an image is selected */}
        {tempAvatarUri && (
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={uploadAvatar}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Avatar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={cancelUpload}
              disabled={uploading}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        <MenuItem icon="heart-outline" title="My Favorites" onPress={() => navigation.navigate('Favorites')} />
        <MenuItem icon="chatbubble-outline" title="My Chats" onPress={() => navigation.navigate('Chat')} />
        <MenuItem icon="calendar-outline" title="Visit Requests" onPress={() => navigation.navigate('VisitRequests')} />
        <MenuItem icon="add-circle-outline" title="Add Property" onPress={() => navigation.navigate('CreateProperty')} />
        <MenuItem
          icon="home-outline"
          title="My Properties"
          onPress={() => navigation.navigate('MyProperties')}
        />
        <MenuItem icon="log-out-outline" title="Logout" onPress={handleLogout} color="#EF4444" />
      </View>
    </ScrollView>
  );
}

const MenuItem = ({ icon, title, onPress, color }: any) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color || colors.primary} />
      <Text style={[styles.menuText, { color: color || colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#4A0E06',
    borderRadius: 20,
    padding: 4,
  },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 14, marginBottom: 8 },
  menu: { paddingHorizontal: 20, marginTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D4D4D5',
  },
  menuText: { fontSize: 16, marginLeft: 16 },
  saveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
});