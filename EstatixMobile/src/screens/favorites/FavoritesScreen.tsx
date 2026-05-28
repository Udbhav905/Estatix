import React, { useCallback } from "react";
import { View, FlatList, Text, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { getFavorites } from "../../api/property";
import PropertyCard from "../../components/PropertyCard";
import { useTheme } from "../../hooks/useTheme";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Ionicons } from "@expo/vector-icons";

export default function FavoritesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const {
    data: favorites,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavorites().then((res) => res.data),
    // Disable automatic refetch on window focus (we'll control it manually via useFocusEffect)
    staleTime: 0,
  });

  // Refetch every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading && !favorites) return <LoadingSpinner />;

  const hasFavorites = favorites && favorites.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!hasFavorites ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="heart-outline" size={64} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 16 }}>No favorites yet</Text>
          <Text style={{ color: colors.muted, marginTop: 8, fontSize: 14 }}>❤️ Like properties to see them here</Text>
        </View>
      ) : (
        <FlatList data={favorites} keyExtractor={(item) => item.id} renderItem={({ item, index }) => <PropertyCard property={item.property} index={index} onPress={() => navigation.navigate("PropertyDetail", { id: item.property.id })} />} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />} />
      )}
    </View>
  );
}
