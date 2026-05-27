import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useFavoriteStore } from '../../store/favoriteStore';
import ThemeToggle from '../../components/ThemeToggle';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, loadStoredAuth } = useAuth();
  const { colors } = useTheme();
  const { loadFavorites } = useFavoriteStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', onPress: () => logout() }]);
  };

  const pickAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (!result.canceled) {
    const uri = result.assets[0].uri;
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Avatar updated successfully!');
      await loadStoredAuth();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload avatar');
    }
  }
}; 
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickAvatar}>
          <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
          <View style={styles.cameraIcon}><Ionicons name="camera" size={16} color="#fff" /></View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>
        <ThemeToggle />
      </View>
      <View style={styles.menu}>
        <MenuItem icon="heart-outline" title="My Favorites" onPress={() => navigation.navigate('Favorites')} />
        <MenuItem icon="chatbubble-outline" title="My Chats" onPress={() => navigation.navigate('Chat')} />
        <MenuItem icon="calendar-outline" title="Visit Requests" onPress={() => navigation.navigate('VisitRequests')} />
        <MenuItem icon="add-circle-outline" title="Add Property" onPress={() => navigation.navigate('CreateProperty')} />
        <MenuItem icon="map-outline" title="My Properties on Map" onPress={() => navigation.navigate('PropertyMap', { propertyId: undefined })} />
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
  cameraIcon: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#4A0E06', borderRadius: 20, padding: 4 },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 14, marginBottom: 8 },
  menu: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#D4D4D5' },
  menuText: { fontSize: 16, marginLeft: 16 },
});