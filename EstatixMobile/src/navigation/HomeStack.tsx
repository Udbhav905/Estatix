import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import CreatePropertyScreen from '../screens/home/CreatePropertyScreen';
import PropertyDetailScreen from '../screens/home/PropertyDetailScreen';
import EditPropertyScreen from '../screens/home/EditPropertyScreen';
import BookingScreen from '../screens/visits/BookingScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="CreateProperty" component={CreatePropertyScreen} />
      <Stack.Screen name="EditProperty" component={EditPropertyScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}
