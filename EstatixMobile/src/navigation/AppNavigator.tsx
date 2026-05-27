import React from "react";
import { useAuthStore } from "../store/authStore";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import AdminStack from "./AdminStack";
import { View, ActivityIndicator } from "react-native";

export default function AppNavigator() {
  const { user, isLoading, token } = useAuthStore();
  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (!token || !user) return <AuthStack />;
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return <AdminStack />;
  return <MainTabs />;
}
