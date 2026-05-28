// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import CreatePropertyScreen from '../screens/home/CreatePropertyScreen';
import EditPropertyScreen from '../screens/home/EditPropertyScreen';
import PropertyDetailScreen from '../screens/home/PropertyDetailScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import BookingScreen from '../screens/visits/BookingScreen';
import PropertyMapScreen from '../screens/maps/PropertyMapScreen';
import LocationPickerScreen from '../screens/maps/LocationPickerScreen';
import AdminStack from './AdminStack';
import MyPropertiesScreen from '../screens/profile/MyPropertiesScreen';
import VisitRequestsScreen from '../screens/visits/VisitRequestsScreen';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, token } = useAuthStore();
  const insets = useSafeAreaInsets(); // ✅ get safe area insets

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token || !user) {
    return <AuthStack />;
  }

  if (user.role === 'ADMIN') {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <AdminStack />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="CreateProperty"
          component={CreatePropertyScreen}
          options={{ headerShown: true, title: 'Add Property' }}
        />
        <RootStack.Screen
          name="EditProperty"
          component={EditPropertyScreen}
          options={{ headerShown: true, title: 'Edit Property' }}
        />
        <RootStack.Screen
          name="PropertyDetail"
          component={PropertyDetailScreen}
          options={{ headerShown: true }}
        />
        <RootStack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={{ headerShown: true }}
        />
        <RootStack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ headerShown: true, title: 'Book Visit' }}
        />
        <RootStack.Screen
          name="PropertyMap"
          component={PropertyMapScreen}
          options={{ headerShown: true, title: 'Property Map' }}
        />
        <RootStack.Screen
          name="LocationPicker"
          component={LocationPickerScreen}
          options={{ headerShown: true, title: 'Pick Location' }}
        />
        <RootStack.Screen
          name="MyProperties"
          component={MyPropertiesScreen}
          options={{ headerShown: true, title: 'My Properties' }}
        />
        <RootStack.Screen
          name="VisitRequests"
          component={VisitRequestsScreen}
          options={{ headerShown: true, title: 'Visit Requests' }}
        />
      </RootStack.Navigator>
    </View>
  );
}