export default {
  expo: {
    name: "Estatix",
    slug: "estatix",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "automatic",
    splash: { image: "./assets/logo.png", resizeMode: "contain", backgroundColor: "#f7f5f3ab" },
    assetBundlePatterns: ["**/*"],
    ios: { supportsTablet: true, bundleIdentifier: "com.estatix.app" },
    android: { 
      adaptiveIcon: { foregroundImage: "./assets/logo.png", backgroundColor: "#F7F5F3" }, 
      package: "com.estatix.app"
    },
    web: { favicon: "./assets/logo.png" },
    plugins: [
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
        },
      ],
    ],
    extra: { API_URL: "http://10.201.149.61:5000/api" }
  }
};