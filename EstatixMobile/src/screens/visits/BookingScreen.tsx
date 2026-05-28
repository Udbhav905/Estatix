import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createVisit } from '../../api/visit';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';

export default function BookingScreen({ route, navigation }: any) {
  const { propertyId } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { colors } = useTheme();
  const { impact, notification } = useHaptic();

  // Combine date and time into a single Date object
  const getCombinedDateTime = () => {
    const date = new Date(selectedDate);
    const time = new Date(selectedTime);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  };

  const handleBooking = async () => {
    try {
      impact();
      const finalDateTime = getCombinedDateTime();
      await createVisit({ propertyId, date: finalDateTime.toISOString() });
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

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const onTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (time) setSelectedTime(time);
  };

  const showDatePickerModal = () => setShowDatePicker(true);
  const showTimePickerModal = () => setShowTimePicker(true);

  const formattedDate = selectedDate.toLocaleDateString();
  const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Select Date & Time</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Choose a date and time for your property visit
      </Text>

      {/* Date Selector */}
      <TouchableOpacity
        onPress={showDatePickerModal}
        style={[styles.pickerButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      >
        <Text style={[styles.pickerLabel, { color: colors.muted }]}>Date</Text>
        <Text style={[styles.pickerValue, { color: colors.text }]}>{formattedDate}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Time Selector */}
      <TouchableOpacity
        onPress={showTimePickerModal}
        style={[styles.pickerButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      >
        <Text style={[styles.pickerLabel, { color: colors.muted }]}>Time</Text>
        <Text style={[styles.pickerValue, { color: colors.text }]}>{formattedTime}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* Combined preview */}
      <View style={[styles.preview, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.previewLabel, { color: colors.muted }]}>Selected Visit Time</Text>
        <Text style={[styles.previewValue, { color: colors.primary }]}>
          {formattedDate} at {formattedTime}
        </Text>
      </View>

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
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pickerLabel: { fontSize: 14, fontWeight: '500' },
  pickerValue: { fontSize: 16, fontWeight: '600' },
  preview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  previewLabel: { fontSize: 12, marginBottom: 4 },
  previewValue: { fontSize: 18, fontWeight: 'bold' },
  requestBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  requestBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});