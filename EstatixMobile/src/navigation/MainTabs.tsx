// navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PropertyMapScreen from '../screens/maps/PropertyMapScreen';
import { useTheme } from '../hooks/useTheme';

const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

// ✅ Only ChatStack needed here — all other screens are in RootStack (AppNavigator)
function ChatStackNavigator() {
  const { colors } = useTheme();
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <ChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <ChatStack.Screen
        name="ChatRoomScreen"
        component={ChatRoomScreen}
        options={{ title: 'Chat' }}
      />
    </ChatStack.Navigator>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Chat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: true, // ✅ show headers for tab screens
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} options={{ headerShown: false }} />
      {/* <Tab.Screen name="Map" component={PropertyMapScreen} options={{ title: 'Map' }} /> */}
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}