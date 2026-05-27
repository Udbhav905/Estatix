import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { getProperty, getProperties } from '../../api/property';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function PropertyMapScreen({ route }: any) {
  const { propertyId, ownerId } = route.params || {};

  // Query for a single property if propertyId is provided
  const { data: property, isLoading: isLoadingSingle } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getProperty(propertyId!).then(res => res.data),
    enabled: !!propertyId,
  });

  // Query for multiple properties if no propertyId is provided
  const { data: propertiesData, isLoading: isLoadingMultiple } = useQuery({
    queryKey: ['properties', { ownerId, limit: 100 }],
    queryFn: () => getProperties({ ownerId, limit: 100 }).then(res => res.data.properties),
    enabled: !propertyId,
  });

  const isLoading = propertyId ? isLoadingSingle : isLoadingMultiple;
  if (isLoading) return <LoadingSpinner />;

  let initialRegion = { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
  let markers: any[] = [];

  if (propertyId && property) {
    if (property.latitude && property.longitude) {
      initialRegion = {
        latitude: property.latitude,
        longitude: property.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      markers.push({
        id: property.id,
        latitude: property.latitude,
        longitude: property.longitude,
        title: property.title,
        price: property.price,
      });
    }
  } else if (propertiesData && Array.isArray(propertiesData)) {
    propertiesData.forEach((p: any) => {
      if (p.latitude && p.longitude) {
        markers.push({
          id: p.id,
          latitude: p.latitude,
          longitude: p.longitude,
          title: p.title,
          price: p.price,
        });
      }
    });

    if (markers.length > 0) {
      initialRegion = {
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={`$${m.price.toLocaleString()}`}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, map: { width, height } });