import ActionButton from "@/components/ActionButton";
import GradientBackground from "@/components/Gradient";
import { uploadImageToCloudinary } from "@/utils/ImageUploader";
import { Ionicons } from "@expo/vector-icons";
import { getApp } from "@react-native-firebase/app";
import { getAuth, updateProfile } from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "@react-native-firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const app = getApp();
const authInstance = getAuth(app);
const firestoreInstance = getFirestore(app);

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  location: string;
  relationshipStatus: "Connected" | "Single" | "";
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    uid: "",
    displayName: "",
    email: "",
    photoURL: "",
    bio: "",
    location: "",
    relationshipStatus: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);



useEffect(() => {
  const currentUser = authInstance.currentUser;
  if (currentUser) {
    setUser(currentUser);
    setProfile({
      uid: currentUser.uid,
      displayName: currentUser.displayName || "",
      email: currentUser.email || "",
      photoURL: currentUser.photoURL || "",
      bio: "",
      location: "",
      relationshipStatus: "",
    });

    loadUserProfile(currentUser.uid);
  }
}, []);

const loadUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(firestoreInstance, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setProfile((prev) => ({
        ...prev,
        ...userData,
      }));
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
};

const saveProfile = async () => {
  if (!user) return;

  setLoading(true);
  try {
    await updateProfile(user, {
      displayName: profile.displayName,
      photoURL: profile.photoURL,
    });
    await setDoc(
      doc(firestoreInstance, "users", profile.uid),
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  } catch (error) {
    console.error("Error saving profile:", error);
    Alert.alert("Error", "Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  const updateProfileField = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setUploadingProfile(true);

        // You can use email or uid as the publicId
        const publicId = `${profile?.uid || "user"}_profile`;

        const uploadedUrl = await uploadImageToCloudinary(imageUri, {
          publicId,
          folder: "user_profiles", // optional, organizes files in Cloudinary
        });

        setImage(imageUri);

        setProfile((prev) => ({
          ...prev,
          photoURL: uploadedUrl,
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploadingProfile(false);
    }
  };

  return (
    <>
      <GradientBackground />
      <ScrollView className="flex-1" contentContainerClassName="pt-8 pb-8">
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="w-full flex-row items-center justify-between mb-8">
            <Text className="text-3xl font-bold text-rose-500 dark:text-rose-400">
              Profile
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className="p-2 mr-4"
              >
                {isEditing ? (
                  <Ionicons name="close" size={24} color="#fff" />
                ) : (
                  <Ionicons name="create-outline" size={24} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/setting")}
                className="p-2"
              >
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Avatar */}
          <View className="items-center mb-8">
            {/* Avatar */}
            <View className="w-32 h-32 relative rounded-full bg-white dark:bg-gray-800 items-center justify-center">
              {profile.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  className="w-full h-full rounded-full"
                />
              ) : image ? (
                <Image
                  source={{ uri: image }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="text-4xl">👤</Text>
              )}

              {/* Centered Edit Icon */}
              {isEditing && (
                <TouchableOpacity
                  onPress={pickImage}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3"
                >
                  {uploadingProfile ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Profile Information */}
          <View className="space-y-4 mb-8">
            {/* Display Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </Text>
              {isEditing ? (
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.9)",
                    "rgba(255, 245, 247, 0.8)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl flex-row items-center justify-between overflow-hidden border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="rounded-2xl px-4 py-4 text-gray-800 dark:text-gray-200 text-base"
                    value={profile.displayName}
                    onChangeText={(text) =>
                      updateProfileField("displayName", text)
                    }
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                  />{" "}
                  {isEditing && (
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color="#9CA3AF"
                      className="mr-4"
                    />
                  )}
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.95)",
                    "rgba(255, 245, 247, 0.9)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl overflow-hidden p-4 border border-rose-100 dark:border-rose-800"
                >
                  <Text className="text-gray-800 dark:text-gray-200 text-base">
                    {profile.displayName || "Not set"}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Bio */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </Text>
              {isEditing ? (
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.9)",
                    "rgba(255, 245, 247, 0.8)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl flex-row items-center justify-between overflow-hidden border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="px-4 py-4 text-gray-800 dark:text-gray-200 text-base"
                    value={profile.bio}
                    onChangeText={(text) => updateProfileField("bio", text)}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />{" "}
                  {isEditing && (
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color="#9CA3AF"
                      className="mr-4"
                    />
                  )}
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.95)",
                    "rgba(255, 245, 247, 0.9)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl overflow-hidden p-4 border border-rose-100 dark:border-rose-800"
                >
                  <Text className="text-gray-800 dark:text-gray-200 text-base">
                    {profile.bio || "No bio added yet"}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </Text>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.95)",
                  "rgba(255, 245, 247, 0.9)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl flex-row items-center justify-between overflow-hidden p-4 border border-rose-100 dark:border-rose-800"
              >
                <Text className="text-gray-600 dark:text-gray-400 text-base">
                  {profile.email}
                </Text>
              </LinearGradient>
            </View>

            {/* Location */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </Text>
              {isEditing ? (
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.9)",
                    "rgba(255, 245, 247, 0.8)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl overflow-hidden border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="px-4 py-4 text-gray-800 dark:text-gray-200 text-base"
                    value={profile.location}
                    onChangeText={(text) =>
                      updateProfileField("location", text)
                    }
                    placeholder="Enter your location"
                    placeholderTextColor="#9CA3AF"
                  />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.95)",
                    "rgba(255, 245, 247, 0.9)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl overflow-hidden p-4 border border-rose-100 dark:border-rose-800"
                >
                  <Text className="text-gray-800 dark:text-gray-200 text-base">
                    {profile.location || "Location not set"}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </View>
          {/* //FIXME Fix this always true condition */}
          {true && (
            <View className="space-y-4 my-4 pb-5">
              <ActionButton
                onPress={()=> router.push("/connect")}
                loading={loading}
                text="Connect with your partner 💞"
              />
            </View>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <View className="space-y-4">
              <ActionButton
                onPress={saveProfile}
                loading={loading}
                text="Save Changes"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default Profile;
