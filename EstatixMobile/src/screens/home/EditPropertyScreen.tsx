import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperty, updateProperty } from '../../api/property';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function EditPropertyScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { impact } = useHaptic();
  const queryClient = useQueryClient();
  const { data: property, isLoading } = useQuery({ queryKey: ['property', id], queryFn: () => getProperty(id).then(res => res.data) });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (property) setForm(property); }, [property]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProperty(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['property', id] }); Alert.alert('Success', 'Property updated'); navigation.goBack(); },
  });

  const handleSubmit = () => { impact(); updateMutation.mutate(form); };
  if (isLoading) return <LoadingSpinner />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.label, { color: colors.text }]}>Title</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
      <Text style={[styles.label, { color: colors.text }]}>Description</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border, height: 100 }]} multiline value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
      <Text style={[styles.label, { color: colors.text }]}>Price</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} keyboardType="numeric" value={String(form.price)} onChangeText={(v) => setForm({ ...form, price: Number(v) })} />
      <Text style={[styles.label, { color: colors.text }]}>Type</Text>
      <Picker selectedValue={form.type} onValueChange={(v) => setForm({ ...form, type: v })} style={{ color: colors.text }}>
        <Picker.Item label="Sale" value="SALE" />
        <Picker.Item label="Rent" value="RENT" />
      </Picker>
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      <Picker selectedValue={form.category} onValueChange={(v) => setForm({ ...form, category: v })} style={{ color: colors.text }}>
        <Picker.Item label="Apartment" value="Apartment" /><Picker.Item label="Villa" value="Villa" /><Picker.Item label="Penthouse" value="Penthouse" />
      </Picker>
      <Text style={[styles.label, { color: colors.text }]}>Address</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
      <Text style={[styles.label, { color: colors.text }]}>City</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]} value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, marginVertical: 20 }]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 0.5, borderRadius: 12, padding: 12, fontSize: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});