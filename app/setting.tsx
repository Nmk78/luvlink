import type React from "react";

import GradientBackground from "@/components/Gradient";
import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsScreen = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await auth().signOut();
            console.log("User signed out successfully!");
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  //   const handleDeleteAccount = () => {
  //     Alert.alert("Delete Account", "This action cannot be undone. All your data will be permanently deleted.", [
  //       {
  //         text: "Cancel",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Delete",
  //         style: "destructive",
  //         onPress: () => {
  //           Alert.alert("Feature Coming Soon", "Account deletion will be available in a future update.")
  //         },
  //       },
  //     ])
  //   }

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const SettingItem = ({
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View className="rounded-2xl p-4 mb-3 border bg-gray-100 shadow-md border-rose-100 dark:border-rose-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-800 dark:text-gray-200 text-base font-medium">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {subtitle}
              </Text>
            )}
          </View>
          {rightComponent ||
            (showArrow && <Text className="text-rose-400 text-lg">›</Text>)}
        </View>
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-6 first:mt-0">
      {title}
    </Text>
  );

  return (
    <>
      <View className="mb-20 z-50">
        <GradientBackground />
        {/* Header */}
        <View className="flex-row w-full items-center justify-start mb-6 pt-8 px-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-white mb-2">Settings</Text>
          <Text className="text-lg text-white ">Manage your preferences</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-8 mb-14 overflow-visible">
        {/* Account Section */}
        <SectionHeader title="Account" />
        <SettingItem
          title="Profile"
          subtitle={user?.email || "Manage your profile information"}
          onPress={() => router.push("/profile")}
        />

        <SettingItem
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Privacy settings will be set soon!"
            )
          }
        />

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <SettingItem
          title="Dark Mode"
          //   subtitle={`Currently ${
          //     colorScheme === "dark" ? "enabled" : "disabled"
          //   }`}
          subtitle="Feature coming soon!"
          //   onPress={toggleColorScheme}
          showArrow={false}
          rightComponent={
            <Switch
              value={colorScheme === "dark"}
              disabled={true} // Disable the switch for now
              onValueChange={toggleColorScheme}
              trackColor={{ false: "#f3f4f6", true: "#ff6b9d" }}
              thumbColor={colorScheme === "dark" ? "#ffffff" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          title="Notifications"
          subtitle="Push notifications and alerts"
          showArrow={false}
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#f3f4f6", true: "#ff6b9d" }}
              thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          title="Location Services"
          subtitle="Share location with your partner"
          showArrow={false}
          rightComponent={
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: "#f3f4f6", true: "#ff6b9d" }}
              thumbColor={locationEnabled ? "#ffffff" : "#f4f3f4"}
            />
          }
        />

        {/* Support Section */}
        <SectionHeader title="Support" />
        {/* <SettingItem
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => openURL("https://help.example.com")}
        /> */}

        <SettingItem
          title="Contact developer"
          subtitle="Send feedback or report issues"
          onPress={() => openURL("mailto:naymyokhant78@gmail.com")}
        />

        <SettingItem
          title="Rate App"
          subtitle="Rate us on the App Store"
          onPress={() =>
            Alert.alert(
              "Thank You!",
              "This would open the App Store rating page."
            )
          }
        />

        {/* About Section */}
        <SectionHeader title="About" />
        <SettingItem
          title="App Version"
          subtitle="1.0.0 (Build 1)"
          showArrow={false}
        />

        <SettingItem
          title="Terms of Service"
          onPress={() =>
            Alert.alert("Coming Soon", "Terms of Service will be set soon!")
          }
          //   onPress={() => openURL("https://example.com/terms")}
        />

        <SettingItem
          title="Privacy Policy"
          onPress={() => openURL("https://example.com/privacy")}
        />

        <SettingItem
          title="Open Source Licenses"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "License information will be available soon!"
            )
          }
        />

        {/* Danger Zone */}
        <SectionHeader title="Account Actions" />

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleSignOut} disabled={loading}>
          <View className="rounded-2xl p-4 mb-3 border bg-red-500 border-red-200 dark:border-red-800">
            <Text className="text-white text-base font-medium text-center">
              {loading ? "Signing Out..." : "Sign Out"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Delete Account Button */}
        {/* <TouchableOpacity onPress={handleDeleteAccount}>
          <LinearGradient
            colors={["rgba(239, 68, 68, 0.15)", "rgba(220, 38, 38, 0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-4 mb-8 border border-red-300 dark:border-red-700"
          >
            <Text className="text-red-700 dark:text-red-300 text-base font-medium text-center">Delete Account</Text>
          </LinearGradient>
        </TouchableOpacity> */}
      </ScrollView>
    </>
  );
};

export default SettingsScreen;
