import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../../api/property';
import PropertyCard from '../../components/PropertyCard';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';

export default function MyPropertiesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: () => getProperties({ ownerId: user?.id, limit: 100 }).then(res => res.data?.properties ?? res.data ?? []),
    enabled: !!user?.id,
  });

  const properties = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PropertyCard
            property={item}
            index={index}
            onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.muted }}>You have not added any properties yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
    paddingTop: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
});
