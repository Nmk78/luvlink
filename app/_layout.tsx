
import { GradientProvider, useGradients } from "@/hooks/provider/gradientProvider";
import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Wrap layout in try/catch to catch rendering errors
  try {
    return (
      <GradientProvider>
        <AppWithGradient />
      </GradientProvider>
    );
  } catch (e: unknown) {
    setError(e as Error);
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "red", fontSize: 18, textAlign: "center" }}>
          App crashed with error:
          {"\n"}
          {error.message}
        </Text>
      </View>
    );
  }

  return null; // fallback
}

// ✨ Split into its own component so the hook is used inside the provider
function AppWithGradient() {
  const gradient = useGradients();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={gradient[0]}
        translucent={false}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: gradient[0],
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="setting" />
          </Stack>
        </SafeAreaView>
      </View>
    </>
  );
}
