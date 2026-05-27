import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createProperty } from "../../api/property";
import { useTheme } from "../../hooks/useTheme";
import { useHaptic } from "../../hooks/useHaptic";
import ImagePickerComponent from "../../components/ImagePicker";
import { useAuthStore } from "../../store/authStore";

export default function CreatePropertyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { impact } = useHaptic();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false); // extra guard

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

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.address) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    // Prevent concurrent submissions (button disabled + ref guard)
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
        // Extract file name and type from URI (assuming file:// or content://)
        const filename = uri.split('/').pop() || `photo_${idx}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append("images", { uri, type, name: filename } as any);
      });

      // Increase timeout on this specific call if your API client allows it
      const response = await createProperty(formData);
      // If we reach here, success
      Alert.alert("Success", "Property created and pending approval.");
      navigation.goBack();
    } catch (error: any) {
      console.error("Create property error:", error);
      // Log detailed error for debugging
      let errorMsg = "Failed to create property. Please try again.";
      if (error.message?.includes("timeout")) {
        errorMsg = "Upload took too long. Your property might have been created anyway. Please check your listings before retrying.";
      } else if (error.response) {
        errorMsg = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      }
      Alert.alert("Error", errorMsg);
      // Do NOT clear submittingRef here – user must manually retry,
      // but they can try again after seeing the alert.
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
});