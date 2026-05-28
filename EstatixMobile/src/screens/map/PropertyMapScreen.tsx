// screens/map/PropertyMapScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapPressEvent } from 'react-native-maps';
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
  type: string;
}

interface Props {
  navigation: any;
  route: any;
}

export default function PropertyMapScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const ownerId = route?.params?.ownerId;
  const isPickMode = route?.params?.pickMode;         // ✅ for location picking
  const onLocationPicked = route?.params?.onPick;     // ✅ callback

  const [region, setRegion] = useState({
    latitude: 23.0225,
    longitude: 72.5714,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [pickedLocation, setPickedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // ✅ Fetch properties — filter by ownerId if provided
  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'map', ownerId],
    queryFn: () => getProperties(ownerId ? { ownerId, limit: 100 } : { limit: 100 })
      .then(res => res.data?.properties ?? res.data ?? []),
  });

  const properties: Property[] = (Array.isArray(data) ? data : [])
    .filter((p: Property) => p.latitude && p.longitude);

  // ✅ Go to user's current location
  const goToMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setRegion(r => ({
        ...r,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }));
    } catch {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLocating(false);
    }
  };

  // ✅ Handle map tap for pick mode
  const handleMapPress = (e: MapPressEvent) => {
    if (!isPickMode) return;
    setPickedLocation(e.nativeEvent.coordinate);
  };

  // ✅ Confirm picked location and go back
  const confirmLocation = () => {
    if (!pickedLocation) return;
    if (onLocationPicked) {
      onLocationPicked(pickedLocation);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* ✅ Property markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            coordinate={{ latitude: property.latitude, longitude: property.longitude }}
            title={property.title}
            description={`₹${property.price?.toLocaleString()}`}
            pinColor={colors.primary}
            onCalloutPress={() => {
              if (!isPickMode) {
                navigation.navigate('PropertyDetail', { id: property.id });
              }
            }}
          />
        ))}

        {/* ✅ Picked location marker */}
        {pickedLocation && (
          <Marker
            coordinate={pickedLocation}
            pinColor="blue"
            title="Selected Location"
          />
        )}
      </MapView>

      {/* My Location button */}
      <TouchableOpacity style={[styles.locateBtn, { backgroundColor: colors.cardBg }]} onPress={goToMyLocation}>
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

      {/* No properties message */}
      {!isLoading && properties.length === 0 && !isPickMode && (
        <View style={[styles.emptyBadge, { backgroundColor: colors.cardBg }]}>
          <Text style={{ color: colors.muted }}>No properties with location found</Text>
        </View>
      )}

      {/* ✅ Pick mode UI */}
      {isPickMode && (
        <View style={[styles.pickBar, { backgroundColor: colors.cardBg }]}>
          <Text style={{ color: colors.text, flex: 1 }}>
            {pickedLocation
              ? `📍 ${pickedLocation.latitude.toFixed(5)}, ${pickedLocation.longitude.toFixed(5)}`
              : 'Tap on map to pick location'}
          </Text>
          {pickedLocation && (
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={confirmLocation}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  locateBtn: {
    position: 'absolute', bottom: 100, right: 16,
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
    position: 'absolute', bottom: 100, alignSelf: 'center',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    elevation: 4,
  },
  pickBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    padding: 16, elevation: 8,
  },
  confirmBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
});