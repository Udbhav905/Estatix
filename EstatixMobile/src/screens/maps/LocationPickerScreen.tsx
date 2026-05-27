import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, Region, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

export default function LocationPickerScreen({ navigation, route }: any) {
  const { onSelect } = route.params;
  const { colors } = useTheme();

  // ✅ Region state
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // ✅ Marker uses LatLng (FIXED)
  const [marker, setMarker] = useState<LatLng>({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  // ✅ Get current location
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});

    const newRegion: Region = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(newRegion);

    // ✅ Update marker correctly
    setMarker({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  // ✅ Confirm location
  const confirmLocation = () => {
    onSelect(marker.latitude, marker.longitude);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={(e) => setMarker(e.nativeEvent.coordinate)} // ✅ FIXED
      >
        <Marker
          coordinate={marker} // ✅ FIXED
          draggable
          onDragEnd={(e) => setMarker(e.nativeEvent.coordinate)} // ✅ FIXED
        />
      </MapView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={getCurrentLocation}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>My Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={confirmLocation}
          style={[styles.button, { backgroundColor: colors.secondary }]}
        >
          <Text style={styles.btnText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height: height - 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 14,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});