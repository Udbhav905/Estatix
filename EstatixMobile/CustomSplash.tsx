import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function CustomSplash() {
  return (
    <View style={styles.container}>
      <Image
        source={require("./assets/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Estatix</Text>

      <Text style={styles.subtitle}>
        Find Your Dream Property
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
    letterSpacing: 1,
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 8,
    fontSize: 14,
  },
});