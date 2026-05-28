import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useMoodStore, MoodType } from '../store/moodStore';
import { useTheme } from '../hooks/useTheme';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

const moods: { id: MoodType; label: string; icon: string }[] = [
  { id: null, label: 'All', icon: '🏠' },
  { id: 'calm', label: 'Calm Homes', icon: '🌿' },
  { id: 'luxury', label: 'Luxury Villas', icon: '✨' },
  { id: 'budget', label: 'Budget Smart', icon: '💰' },
  { id: 'nature', label: 'Nature View', icon: '🏞️' },
];

export default function MoodFilterBar() {
  const { activeMood, setMood, clearMood } = useMoodStore();
  const { colors } = useTheme();

  const handlePress = (moodId: MoodType) => {
    if (moodId === null) {
      clearMood();
    } else {
      setMood(moodId);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(200).springify()}>
      <Animated.View layout={Layout.springify()}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.container}
        >
          {moods.map((mood) => {
            const isActive = activeMood === mood.id;
            return (
              <TouchableOpacity
                key={mood.id ?? 'all'}
                style={[
                  styles.moodButton,
                  isActive && { backgroundColor: colors.primary },
                  !isActive && { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => handlePress(mood.id)}
              >
                <Text style={styles.moodIcon}>{mood.icon}</Text>
                <Text style={[styles.moodLabel, { color: isActive ? '#fff' : colors.text }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  moodButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30, gap: 6 },
  moodIcon: { fontSize: 18 },
  moodLabel: { fontSize: 14, fontWeight: '500' },
});