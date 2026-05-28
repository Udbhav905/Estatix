import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from 'react';
import { Picker } from "@react-native-picker/picker";
import { createProperty } from "../../api/property";
import { useTheme } from "../../hooks/useTheme";
import { useHaptic } from "../../hooks/useHaptic";
import ImagePickerComponent from "../../components/ImagePicker";
import { useAuthStore } from "../../store/authStore";
import { useLocationStore } from "../../store/locationStore";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function CreatePropertyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { impact } = useHaptic();
  const { pickedLocation, setPickedLocation } = useLocationStore();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "SALE",
    category: "Apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: "",
    city: "",
    state: "",
    country: "",
    latitude: "",
    longitude: "",
  });
  const [images, setImages] = useState<string[]>([]);

  // ✅ When screen regains focus, read picked location from store
  useFocusEffect(
    useCallback(() => {
      if (pickedLocation) {
        setLocation(pickedLocation);
        setForm((f) => ({
          ...f,
          latitude: String(pickedLocation.latitude),
          longitude: String(pickedLocation.longitude),
        }));
        setPickedLocation(null); // clear after reading
      }
    }, [pickedLocation])
  );

  // ✅ Navigate to LocationPicker — no callback in params
  const openMapPicker = () => {
    navigation.navigate('LocationPicker');
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.address) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (loading || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    impact();

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        const value = form[key as keyof typeof form];
        if (value) formData.append(key, value);
      });

      images.forEach((uri, idx) => {
        const filename = uri.split('/').pop() || `photo_${idx}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append("images", { uri, type, name: filename } as any);
      });

      await createProperty(formData);
      Alert.alert("Success", "Property created and pending approval.");
      navigation.goBack();
    } catch (error: any) {
      console.error("Create property error:", error);
      let errorMsg = "Something went wrong. Please check your property list before retrying.";
      if (error.message?.includes("timeout")) {
        errorMsg = "Upload took too long, but your property may have been created. Please check your listings.";
      } else if (error.response) {
        const status = error.response.status;
        if (status === 400) errorMsg = "Invalid data. Please check your inputs.";
        else if (status === 401) errorMsg = "Session expired. Please log in again.";
        else if (status === 413) errorMsg = "Images are too large. Please use smaller images.";
        else errorMsg = `Server error (${status}). Please try again.`;
      }
      Alert.alert("Upload Issue", errorMsg);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

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
        value={form.price}
        onChangeText={(v) => setForm({ ...form, price: v })}
      />
      <Text style={[styles.label, { color: colors.text }]}>Type</Text>
      <Picker
        selectedValue={form.type}
        onValueChange={(v) => setForm({ ...form, type: v })}
        style={{ color: colors.text }}
      >
        <Picker.Item label="Sale" value="SALE" />
        <Picker.Item label="Rent" value="RENT" />
      </Picker>
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      <Picker
        selectedValue={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
        style={{ color: colors.text }}
      >
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
        value={form.bedrooms}
        onChangeText={(v) => setForm({ ...form, bedrooms: v })}
      />
      <Text style={[styles.label, { color: colors.text }]}>Bathrooms</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        keyboardType="numeric"
        value={form.bathrooms}
        onChangeText={(v) => setForm({ ...form, bathrooms: v })}
      />
      <Text style={[styles.label, { color: colors.text }]}>Area (sqft)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
        keyboardType="numeric"
        value={form.area}
        onChangeText={(v) => setForm({ ...form, area: v })}
      />
      <Text style={[styles.label, { color: colors.text }]}>Address *</Text>
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

      {/* ✅ Map picker button — replaces lat/lng text inputs */}
      <Text style={[styles.label, { color: colors.text }]}>Location</Text>
      <TouchableOpacity
        style={[styles.locationPicker, { borderColor: colors.border, backgroundColor: colors.cardBg }]}
        onPress={openMapPicker}
      >
        <Ionicons name="map-outline" size={20} color={colors.primary} />
        <Text style={{ color: location ? colors.text : colors.muted, marginLeft: 8, flex: 1 }}>
          {location
            ? `📍 ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : 'Tap to pick location on map'}
        </Text>
        {location && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>Images</Text>
      <ImagePickerComponent images={images} setImages={setImages} />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary, marginVertical: 20, opacity: loading ? 0.6 : 1 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Creating..." : "Create Property"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "500", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 0.5, borderRadius: 12, padding: 12, fontSize: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  locationPicker: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 12,
  },
});