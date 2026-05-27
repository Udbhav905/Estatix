import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { getProperty } from '../../api/property';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function PropertyMapScreen({ route }: any) {
  const { propertyId } = route.params;
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getProperty(propertyId).then(res => res.data),
    enabled: !!propertyId,
  });
  if (isLoading) return <LoadingSpinner />;
  const hasCoords = property?.latitude && property?.longitude;
  const initialRegion = hasCoords
    ? { latitude: property.latitude, longitude: property.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {hasCoords && <Marker coordinate={{ latitude: property.latitude, longitude: property.longitude }} title={property.title} description={`$${property.price}`} />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, map: { width, height } });