"use client"

import GradientBackground from "@/components/Gradient"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"

interface UserProfile {
  displayName: string
  email: string
  photoURL: string
  bio: string
  location: string
  relationshipStatus: string
}

const ProfileScreen = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    email: "",
    photoURL: "",
    bio: "",
    location: "",
    relationshipStatus: "Single",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const currentUser = auth().currentUser
    if (currentUser) {
      setUser(currentUser)
      setProfile({
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        photoURL: currentUser.photoURL || "",
        bio: "",
        location: "",
        relationshipStatus: "Single",
      })

      // Load additional profile data from Firestore
      loadUserProfile(currentUser.uid)
    }
  }, [])

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await firestore().collection("users").doc(uid).get()
      if (userDoc.exists) {
        const userData = userDoc.data()
        setProfile((prev) => ({
          ...prev,
          ...userData,
        }))
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update Firebase Auth profile
      await user.updateProfile({
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      })

      // Save additional data to Firestore
      await firestore().collection("users").doc(user.uid).set(
        {
          displayName: profile.displayName,
          email: profile.email,
          photoURL: profile.photoURL,
          bio: profile.bio,
          location: profile.location,
          relationshipStatus: profile.relationshipStatus,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      setIsEditing(false)
      Alert.alert("Success", "Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await auth().signOut()
            console.log("User signed out!")
          } catch (error) {
            console.error("Sign out error:", error)
          }
        },
      },
    ])
  }

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
    <GradientBackground />
      <ScrollView className="flex-1" contentContainerClassName="pt-16 pb-8">
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-3xl font-bold text-rose-500 dark:text-rose-400">Profile</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900"
            >
              <Text className="text-rose-600 dark:text-rose-300 font-medium">{isEditing ? "Cancel" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View className="items-center mb-8">
            <LinearGradient
              colors={["#ff6b9d", "#ffa07a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-32 h-32 rounded-full p-1 mb-4"
            >
              <View className="w-full h-full rounded-full bg-white dark:bg-gray-800 items-center justify-center">
                {profile.photoURL ? (
                  <Image source={{ uri: profile.photoURL }} className="w-full h-full rounded-full" />
                ) : (
                  <Text className="text-4xl">👤</Text>
                )}
              </View>
            </LinearGradient>

            {isEditing && (
              <TouchableOpacity className="px-4 py-2 rounded-full bg-rose-500">
                <Text className="text-white font-medium">Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Information */}
          <View className="space-y-4 mb-8">
            {/* Display Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</Text>
              {isEditing ? (
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 245, 247, 0.8)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="px-4 py-4 text-gray-800 dark:text-gray-200 text-base"
                    value={profile.displayName}
                    onChangeText={(text) => updateProfile("displayName", text)}
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                  />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 245, 247, 0.9)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-4 border border-rose-100 dark:border-rose-800"
                >
                  <Text className="text-gray-800 dark:text-gray-200 text-base">{profile.displayName || "Not set"}</Text>
                </LinearGradient>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</Text>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 245, 247, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-4 border border-rose-100 dark:border-rose-800"
              >
                <Text className="text-gray-600 dark:text-gray-400 text-base">{profile.email}</Text>
              </LinearGradient>
            </View>

            {/* Bio */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</Text>
              {isEditing ? (
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 245, 247, 0.8)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="px-4 py-4 text-gray-800 dark:text-gray-200 text-base"
                    value={profile.bio}
                    onChangeText={(text) => updateProfile("bio", text)}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 245, 247, 0.9)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-4 border border-rose-100 dark:border-rose-800"
                >
                  <Text className="text-gray-800 dark:text-gray-200 text-base">
                    {profile.bio || "No bio added yet"}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Location */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</Text>
              {isEditing ? (
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 245, 247, 0.8)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="px-4 py-4 text-gray-800 dark:text-gray-200 text-base"
                    value={profile.location}
                    onChangeText={(text) => updateProfile("location", text)}
                    placeholder="Enter your location"
                    placeholderTextColor="#9CA3AF"
                  />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 245, 247, 0.9)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-4 border border-rose-100 dark:border-rose-800"
                >
                  <Text className="text-gray-800 dark:text-gray-200 text-base">
                    {profile.location || "Location not set"}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Relationship Status */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relationship Status</Text>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 245, 247, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-4 border border-rose-100 dark:border-rose-800"
              >
                <Text className="text-gray-800 dark:text-gray-200 text-base">{profile.relationshipStatus}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-4">
            {isEditing && (
              <TouchableOpacity onPress={saveProfile} disabled={loading} className={`${loading ? "opacity-50" : ""}`}>
                <LinearGradient
                  colors={["#ff6b9d", "#ffa07a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl py-4 shadow-lg"
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    {loading ? "Saving..." : "Save Changes"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Settings Button */}
            <TouchableOpacity>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 245, 247, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-4 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-center text-lg font-medium">⚙️ Settings</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity onPress={handleSignOut}>
              <LinearGradient
                colors={["rgba(239, 68, 68, 0.9)", "rgba(220, 38, 38, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-4 shadow-lg"
              >
                <Text className="text-white text-center text-lg font-semibold">Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  )
}

export default ProfileScreen
