import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperty, updateProperty } from '../../api/property';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import { useLocationStore } from '../../store/locationStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

export default function EditPropertyScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { impact } = useHaptic();
  const queryClient = useQueryClient();
  const { pickedLocation, setPickedLocation } = useLocationStore();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id).then(res => res.data),
    enabled: !!id,
  });

  const [form, setForm] = useState<any>({});
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (property) {
      setForm(property);
      // ✅ Pre-populate location display if property already has coordinates
      if (property.latitude && property.longitude) {
        setLocation({ latitude: property.latitude, longitude: property.longitude });
      }
    }
  }, [property]);

  // ✅ When screen regains focus, read picked location from store
  useFocusEffect(
    useCallback(() => {
      if (pickedLocation) {
        setLocation(pickedLocation);
        setForm((f: any) => ({
          ...f,
          latitude: pickedLocation.latitude,
          longitude: pickedLocation.longitude,
        }));
        setPickedLocation(null); // clear after reading
      }
    }, [pickedLocation])
  );

  // ✅ Navigate to LocationPicker — no callback in params
  const openMapPicker = () => {
    navigation.navigate('LocationPicker');
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      Alert.alert('Success', 'Property updated successfully');
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error(error);
      Alert.alert('Error', 'Failed to update property. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.price) {
      Alert.alert('Error', 'Title and price are required');
      return;
    }
    impact();
    updateMutation.mutate(form);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!property) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Property not found</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        value={form.title}
        onChangeText={(v) => setForm({ ...form, title: v })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Description</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border, height: 100 }]}
        multiline
        value={form.description}
        onChangeText={(v) => setForm({ ...form, description: v })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Price *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        keyboardType="numeric"
        value={String(form.price)}
        onChangeText={(v) => setForm({ ...form, price: Number(v) })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Type</Text>
      <Picker selectedValue={form.type} onValueChange={(v) => setForm({ ...form, type: v })} style={{ color: colors.text }}>
        <Picker.Item label="Sale" value="SALE" />
        <Picker.Item label="Rent" value="RENT" />
      </Picker>

      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      <Picker selectedValue={form.category} onValueChange={(v) => setForm({ ...form, category: v })} style={{ color: colors.text }}>
        <Picker.Item label="Apartment" value="Apartment" />
        <Picker.Item label="Villa" value="Villa" />
        <Picker.Item label="Penthouse" value="Penthouse" />
        <Picker.Item label="Farmhouse" value="Farmhouse" />
        <Picker.Item label="Commercial" value="Commercial" />
      </Picker>

      <Text style={[styles.label, { color: colors.text }]}>Bedrooms</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        keyboardType="numeric"
        value={String(form.bedrooms || '')}
        onChangeText={(v) => setForm({ ...form, bedrooms: v ? Number(v) : null })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Bathrooms</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        keyboardType="numeric"
        value={String(form.bathrooms || '')}
        onChangeText={(v) => setForm({ ...form, bathrooms: v ? Number(v) : null })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Area (sqft)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        keyboardType="numeric"
        value={String(form.area || '')}
        onChangeText={(v) => setForm({ ...form, area: v ? Number(v) : null })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Address</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        value={form.address}
        onChangeText={(v) => setForm({ ...form, address: v })}
      />

      <Text style={[styles.label, { color: colors.text }]}>City</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        value={form.city}
        onChangeText={(v) => setForm({ ...form, city: v })}
      />

      <Text style={[styles.label, { color: colors.text }]}>State</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        value={form.state}
        onChangeText={(v) => setForm({ ...form, state: v })}
      />

      <Text style={[styles.label, { color: colors.text }]}>Country</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        value={form.country}
        onChangeText={(v) => setForm({ ...form, country: v })}
      />

      {/* ✅ Map picker replaces manual lat/lng inputs */}
      <Text style={[styles.label, { color: colors.text }]}>Location</Text>
      <TouchableOpacity
        style={[styles.locationPicker, { borderColor: colors.border, backgroundColor: colors.cardBg }]}
        onPress={openMapPicker}
      >
        <Ionicons name="map-outline" size={20} color={colors.primary} />
        <Text style={{ color: location ? colors.text : colors.muted, marginLeft: 8, flex: 1 }}>
          {location
            ? `📍 ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : 'Tap to update location on map'}
        </Text>
        {location && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary, marginVertical: 20, opacity: updateMutation.isPending ? 0.6 : 1 }]}
        onPress={handleSubmit}
        disabled={updateMutation.isPending}
      >
        <Text style={styles.buttonText}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 0.5, borderRadius: 12, padding: 12, fontSize: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  locationPicker: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 12,
  },
});