import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const isExpoGoAndroid = isExpoGo && Platform.OS === "android";

// Dynamically require expo-notifications only if NOT running in Expo Go on Android.
// From SDK 53+, importing expo-notifications in Expo Go on Android throws a hard crash on module load.
let Notifications: any;
if (!isExpoGoAndroid) {
  Notifications = require("expo-notifications");
}

let hasLoggedWarning = false;

export const usePushNotifications = () => {
  const { user, token } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (isExpoGoAndroid || !Notifications) {
      if (!hasLoggedWarning) {
        console.log("📢 Info: Push notifications are disabled in Expo Go (Android SDK 53+ platform limitation). Use a custom dev build to test push notifications.");
        hasLoggedWarning = true;
      }
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const registerForPush = async () => {
      if (!token || !user) return;

      try {
        // Use 'as any' to handle type differences across Expo versions
        const perm = (await Notifications.getPermissionsAsync()) as any;
        const existingStatus = perm.status || (perm.granted ? "granted" : "undetermined");
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const req = (await Notifications.requestPermissionsAsync()) as any;
          finalStatus = req.status || (req.granted ? "granted" : "denied");
        }
        if (finalStatus !== "granted") return;

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

        if (!projectId) {
          console.warn(
            "Push notifications warning: No projectId found. " +
            "Please configure extra.eas.projectId in your app.config.js / app.json " +
            "or run 'eas project:init' to associate your project with an Expo account."
          );
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        await api.post("/users/update-push-token", { token: tokenData.data });
      } catch (error) {
        console.warn("Failed to register for push notifications:", error);
      }
    };

    registerForPush();

    // Save subscriptions and later remove by calling .remove()
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log("Notification received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log("Notification clicked:", response);
    });

    // Cleanup: call .remove() on each subscription
    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, [token, user]);
};
