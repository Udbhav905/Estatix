// screens/maps/PropertyMapScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../../api/property';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface Property {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
}

export default function PropertyMapScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const ownerId = route?.params?.ownerId;
  const mapRef = useRef<MapView>(null);

  const [initialRegion] = useState({
    latitude: 23.0225,
    longitude: 72.5714,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });
  const [locating, setLocating] = useState(false);

  // ✅ Fetch properties — filtered by ownerId if coming from Profile
  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'map', ownerId],
    queryFn: () =>
      getProperties(ownerId ? { ownerId, limit: 100 } : { limit: 100 }).then(
        (res) => res.data?.properties ?? res.data ?? []
      ),
  });

  const properties: Property[] = (Array.isArray(data) ? data : []).filter(
    (p: Property) => p.latitude && p.longitude
  );

  const goToMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }, 1000);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            coordinate={{ latitude: property.latitude, longitude: property.longitude }}
            title={property.title}
            description={`₹${property.price?.toLocaleString()}`}
            pinColor={colors.primary}
            onCalloutPress={() => navigation.navigate('PropertyDetail', { id: property.id })}
          />
        ))}
      </MapView>

      {/* My location button */}
      <TouchableOpacity
        style={[styles.locateBtn, { backgroundColor: colors.cardBg }]}
        onPress={goToMyLocation}
      >
        {locating
          ? <ActivityIndicator size="small" color={colors.primary} />
          : <Ionicons name="locate" size={22} color={colors.primary} />
        }
      </TouchableOpacity>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Empty state */}
      {!isLoading && properties.length === 0 && (
        <View style={[styles.emptyBadge, { backgroundColor: colors.cardBg }]}>
          <Text style={{ color: colors.muted }}>
            {ownerId ? 'You have no properties with location set' : 'No properties with location found'}
          </Text>
        </View>
      )}

      {/* Property count badge */}
      {!isLoading && properties.length > 0 && (
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  locateBtn: {
    position: 'absolute', bottom: 40, right: 16,
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  emptyBadge: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 4,
  },
  countBadge: {
    position: 'absolute', top: 16, alignSelf: 'center',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, elevation: 4,
  },
});