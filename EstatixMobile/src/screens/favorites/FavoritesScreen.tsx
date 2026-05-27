import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../../api/property';
import PropertyCard from '../../components/PropertyCard';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { data: favorites, isLoading, refetch } = useQuery({ queryKey: ['favorites'], queryFn: () => getFavorites().then(res => res.data) });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {favorites?.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={64} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 16 }}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList data={favorites} keyExtractor={(item) => item.id} renderItem={({ item, index }) => <PropertyCard property={item.property} index={index} onPress={() => navigation.navigate('PropertyDetail', { id: item.property.id })} />} refreshing={isLoading} onRefresh={refetch} />
      )}
    </View>
  );
}