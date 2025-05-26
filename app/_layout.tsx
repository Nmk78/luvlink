// app/_layout.tsx
import { useAuth } from "@/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ff6b9d"
        translucent={false} // <-- important
      />
      <View
        style={{
          flex: 1,
          backgroundColor: "#ff6b9d", // matches StatusBar
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaView>
      </View>
    </>
  );
}
