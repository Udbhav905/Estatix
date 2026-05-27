import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SearchBar({
  onSearch,
  onFocus,
}: {
  onSearch: (text: string) => void;
  onFocus?: () => void;
}) {
  const [query, setQuery] = useState('');
  const { colors } = useTheme();

  React.useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query, onSearch]);

  // Responsive width
  const initialWidth = width * 0.72;
  const expandedWidth = width * 0.84;

  const widthAnim = useSharedValue(initialWidth);
  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: widthAnim.value,
      transform: [{ scale: scaleAnim.value }],
      elevation: interpolate(scaleAnim.value, [1, 1.03], [2, 6]),
    };
  });

  const handleFocus = () => {
    widthAnim.value = withTiming(expandedWidth, {
      duration: 250,
    });

    scaleAnim.value = withTiming(1.03, {
      duration: 250,
    });
    
    if (onFocus) {
      onFocus();
    }
  };

  const onBlur = () => {
    if (!query) {
      widthAnim.value = withTiming(initialWidth, {
        duration: 250,
      });

      scaleAnim.value = withTiming(1, {
        duration: 250,
      });
    }
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.muted}
          style={styles.icon}
        />

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search properties"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={onBlur}
          onSubmitEditing={() => onSearch(query)}
          returnKeyType="search"
        />

        {query.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setQuery('');
              onSearch('');
            }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSearch('')}
        style={[
          styles.refreshButton,
          { backgroundColor: colors.primary },
        ]}
      >
        <Ionicons
          name="refresh-outline"
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 14,
  },

  container: {
    marginTop:7,
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 100,
    borderWidth: 1,

    paddingHorizontal: 16,
    paddingVertical: 12,

    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    fontWeight: '500',
  },

  refreshButton: {
    marginLeft: 10,

    width: 40,
    height: 40,

    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 3,
  },
});