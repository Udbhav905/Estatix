import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export default function ImagePickerComponent({ images, setImages }: { images: string[]; setImages: (images: string[]) => void }) {
  const { colors } = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setImages([...images, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {images.map((uri, idx) => (
          <View key={idx} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(idx)}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={pickImage}>
          <Ionicons name="add" size={32} color={colors.primary} />
          <Text style={{ color: colors.text }}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flexDirection: 'row', paddingVertical: 8 },
  imageContainer: { marginRight: 12, position: 'relative' },
  image: { width: 100, height: 100, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12 },
  addBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
});