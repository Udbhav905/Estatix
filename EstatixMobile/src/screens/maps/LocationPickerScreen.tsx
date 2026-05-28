import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, MapPressEvent, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLocationStore } from '../../store/locationStore';

export default function LocationPickerScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { setPickedLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);

  const [pickedCoord, setPickedCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [initialRegion] = useState({
    latitude: 23.0225,
    longitude: 72.5714,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleMapPress = (e: MapPressEvent) => {
    setPickedCoord(e.nativeEvent.coordinate);
  };

  const goToMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
      
      setPickedCoord(coords);
    } catch {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLocating(false);
    }
  };

  const confirmLocation = () => {
    if (!pickedCoord) {
      Alert.alert('No location selected', 'Tap on the map to pick a location first.');
      return;
    }
    setPickedLocation(pickedCoord);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {pickedCoord && (
          <Marker coordinate={pickedCoord} title="Selected Location" />
        )}
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

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.cardBg }]}>
        <Text style={{ color: pickedCoord ? colors.text : colors.muted, flex: 1, fontSize: 13 }}>
          {pickedCoord
            ? `📍 ${pickedCoord.latitude.toFixed(5)}, ${pickedCoord.longitude.toFixed(5)}`
            : 'Tap on the map to select a location'}
        </Text>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: pickedCoord ? colors.primary : colors.muted }]}
          onPress={confirmLocation}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  locateBtn: {
    position: 'absolute', bottom: 90, right: 16,
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingBottom: 30, elevation: 8,
  },
  confirmBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginLeft: 8,
  },
});