import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home/HomeScreen";
import FavoritesScreen from "../screens/favorites/FavoritesScreen";
import ChatListScreen from "../screens/chat/ChatListScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CreatePropertyScreen from "../screens/home/CreatePropertyScreen";
import EditPropertyScreen from "../screens/home/EditPropertyScreen";
import VisitRequestsScreen from "../screens/visits/VisitRequestsScreen";
import PropertyMapScreen from "../screens/maps/PropertyMapScreen";
import { useTheme } from "../hooks/useTheme";
import HomeStack from "./HomeStack";

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

function ProfileStackNavigator() {
  const { colors } = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background, elevation: 0 },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Profile" }} />
      <ProfileStack.Screen name="CreateProperty" component={CreatePropertyScreen} options={{ title: "Add Property" }} />
      <ProfileStack.Screen name="EditProperty" component={EditPropertyScreen} options={{ title: "Edit Property" }} />
      <ProfileStack.Screen name="VisitRequests" component={VisitRequestsScreen} options={{ title: "Visit Requests" }} />
      <ProfileStack.Screen name="PropertyMap" component={PropertyMapScreen} options={{ title: "Property Map" }} />
    </ProfileStack.Navigator>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Favorites") iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "Chat") iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          else if (route.name === "Notifications") iconName = focused ? "notifications" : "notifications-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.cardBg, borderTopWidth: 0, elevation: 0, height: 60, paddingBottom: 8 },
        headerStyle: { backgroundColor: colors.background, elevation: 0 },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      {/* <Tab.Screen name="Home" component={HomeScreen} /> */}
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}