import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createVisit } from '../../api/visit';
import { useTheme } from '../../hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { useHaptic } from '../../hooks/useHaptic';

export default function BookingScreen({ route, navigation }: any) {
  const { propertyId } = route.params;
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const { colors } = useTheme();
  const { impact, notification } = useHaptic();


const handleBooking = async () => {
  impact();

  try {
    await createVisit({ propertyId, date: date.toISOString() });

    notification(Haptics.NotificationFeedbackType.Success);

    Alert.alert('Success', 'Visit request sent');
    navigation.goBack();
  } catch (err) {
    Alert.alert('Error', 'Failed to book visit');
  }
};
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, color: colors.text }}>Select Date & Time</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={{ marginVertical: 20, padding: 12, backgroundColor: colors.cardBg, borderRadius: 12 }}>
        <Text style={{ color: colors.text }}>{date.toLocaleString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
      <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }} onPress={handleBooking}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Request Visit</Text>
      </TouchableOpacity>
    </View>
  );
}