import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createVisit } from '../../api/visit';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';

export default function BookingScreen({ route, navigation }: any) {
  const { propertyId } = route.params;
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const { colors } = useTheme();
  const { impact, notification } = useHaptic();

  const handleBooking = async () => {
    try {
      impact();
      await createVisit({ propertyId, date: date.toISOString() });
      notification('success');
      Alert.alert('Success', 'Visit request sent', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      notification('error');
      const msg = err?.response?.data?.error || 'Failed to book visit. Please try again.';
      Alert.alert('Error', msg);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android the picker is a dialog — always hide it after any interaction
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    // Only update if the user confirmed (not dismissed)
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Select Date & Time</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Choose a date and time for your property visit
      </Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[styles.datePicker, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      >
        <Text style={[styles.dateText, { color: colors.text }]}>{date.toLocaleString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* iOS: show confirm button since spinner stays visible */}
      {Platform.OS === 'ios' && showPicker && (
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowPicker(false)}
        >
          <Text style={styles.confirmBtnText}>Confirm Date</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.requestBtn, { backgroundColor: colors.primary }]}
        onPress={handleBooking}
      >
        <Text style={styles.requestBtnText}>Request Visit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  datePicker: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  dateText: { fontSize: 16 },
  confirmBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmBtnText: { color: '#fff', fontWeight: '600' },
  requestBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  requestBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});