import GradientBackground from "@/components/Gradient";
import { Ionicons } from "@expo/vector-icons";
import firestore, {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import auth from '@react-native-firebase/auth';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ConnectScreen = ({
  onConnected,
}: {
  onConnected?: (coupleId: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<"generate" | "join">("generate");
  const [connectionCode, setConnectionCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [coupleData, setCoupleData] = useState<any>(null);
  const [users, setUsers] = useState<{ userA: any; userB: any } | null>(null);
  const user = auth().currentUser;

  // Generate connection code
async function generateConnectionCode() {
  if (!user) return;
  setLoading(true);

  try {
    const now = new Date();
    const connectionCodesRef = collection(firestore(), "connectionCodes");

    const allCodesSnap = await getDocs(connectionCodesRef);

    const deletions = allCodesSnap.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const createdAt = data?.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt instanceof Date
        ? data.createdAt
        : null;

      if (!createdAt || new Date(createdAt.getTime() + 60 * 60 * 1000) < now) {
        await deleteDoc(docSnap.ref);
      }
    });

    await Promise.all(deletions);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(connectionCodesRef, code), {
      code,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      coupleId: null,
    });

    setConnectionCode(code);
  } catch (e: any) {
    Alert.alert("Error in generating code", e.message);
  }

  setLoading(false);
}


  // Join with connection code
async function joinWithConnectionCode() {
  const user = auth().currentUser;
  console.log("🚀 ~ joinWithConnectionCode ~ user:", user);
  if (!user) return;

  setLoading(true);

  try {
    const code = inputCode.trim().toUpperCase();
    console.log("🚀 ~ joinWithConnectionCode ~ code:", code);

    const codeRef = doc(collection(firestore(), "connectionCodes"), code);
    const codeSnap = await getDoc(codeRef);
    console.log("🚀 ~ joinWithConnectionCode ~ codeSnap:", codeSnap);

    if (!codeSnap.exists()) throw new Error("Invalid or expired code");

    const codeData = codeSnap.data();
    const createdAt = codeData?.createdAt?.toDate
      ? codeData.createdAt.toDate()
      : codeData?.createdAt instanceof Date
      ? codeData.createdAt
      : null;

    if (!createdAt) {
      await deleteDoc(codeRef);
      throw new Error("Code has no timestamp");
    }

    const expirationTime = new Date(createdAt.getTime() + 60 * 60 * 1000); // 1 hour
    if (expirationTime < new Date()) {
      await deleteDoc(codeRef);
      throw new Error("Code has expired");
    }

    const userAId = codeData?.createdBy;
    console.log("🚀 ~ joinWithConnectionCode ~ userAId:", userAId);
    const userBId = user.uid;
    console.log("🚀 ~ joinWithConnectionCode ~ userBId:", userBId);

    if (userAId === userBId) {
      throw new Error("You can't connect with yourself");
    }

    // Stable couple ID regardless of who connects
    const coupleId =
      userAId < userBId ? `${userAId}_${userBId}` : `${userBId}_${userAId}`;

    const coupleRef = doc(collection(firestore(), "couples"), coupleId);
    const coupleSnap = await getDoc(coupleRef);
    console.log("🚀 ~ joinWithConnectionCode ~ coupleSnap:", coupleSnap);

    if (coupleSnap.exists()) {
      // Couple already exists (avoid overwriting)
      throw new Error("You are already connected with this user");
    }

    const coupleDoc = {
      userA: userAId,
      userB: userBId,
      createdAt: serverTimestamp(),
      anniversaryDate: serverTimestamp(),
      connectionCode: code,
      distance: 0,
      totalDaysTogether: 0,
    };

    await setDoc(coupleRef, coupleDoc);
    await updateDoc(codeRef, { coupleId });

    try {
      const usersRef = collection(firestore(), "users");
      const userARef = doc(usersRef, userAId);
      const userBRef = doc(usersRef, userBId);

      await updateDoc(userARef, { coupleId });
      await updateDoc(userBRef, { coupleId });

      console.log("🚀 ~ joinWithConnectionCode setting coupleID done");
    } catch (error) {
      console.log("Error in setting couple ID", error);
    }

    setIsConnected(true);
    setCoupleData({ ...coupleDoc, id: coupleId }); // Optional: include ID
    onConnected?.(coupleId);
  } catch (e: any) {
    Alert.alert("Error while linking!", e.message || "Something went wrong");
  }

  setLoading(false);
}

// Check if user is already connected
useEffect(() => {
  if (!user) return;

  const couplesRef = collection(firestore(), "couples");

  const q1 = query(couplesRef, where("userA", "==", user.uid));
  const q2 = query(couplesRef, where("userB", "==", user.uid));

  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    if (snapshot && !snapshot.empty) {
      const couple = snapshot.docs[0].data();
      setCoupleData(couple);
      setIsConnected(true);
      onConnected?.(snapshot.docs[0].id);
    }
  });

  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    if (snapshot && !snapshot.empty) {
      const couple = snapshot.docs[0].data();
      setCoupleData(couple);
      setIsConnected(true);
      onConnected?.(snapshot.docs[0].id);
    }
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}, [onConnected, user]);

// Fetch both users and redirect after connection
useEffect(() => {
  if (!isConnected || !coupleData) return;

  const fetchUsers = async () => {
    try {
      const usersRef = collection(firestore(), "users");

      const userADoc = await getDoc(doc(usersRef, coupleData.userA));
      const userBDoc = await getDoc(doc(usersRef, coupleData.userB));

      if (!userADoc.exists() || !userBDoc.exists()) {
        throw new Error("One or both users not found");
      }

      console.log("🚀 ~ fetchUsers ~ coupleData:", coupleData);
      console.log(
        "🚀 ~ fetchUsers ~ userADoc:",
        JSON.stringify(
          {
            userA: userADoc.data(),
            userB: userBDoc.data(),
          },
          null,
          2
        )
      );

      setUsers({
        userA: userADoc.data(),
        userB: userBDoc.data(),
      });
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  };

  fetchUsers();

  const timer = setTimeout(() => {
    router.push("/"); // replace with your route path
  }, 15000);

  return () => clearTimeout(timer);
}, [isConnected, coupleData]);
  console.log("🚀 ~ users:", JSON.stringify(users, null, 2));

  if (isConnected && coupleData) {
    return (
      <View>
        <GradientBackground />
        <View className="flex-1 justify-center px-6">
          <Text className="text-6xl mb-6 text-center">💕</Text>
          <Text className="text-4xl font-bold text-rose-500 dark:text-rose-400 text-center mb-4">
            Connected!
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
            You are now connected with your partner
          </Text>

          {/* Show user info if available */}
          {users ? (
            <View className="flex-1 flex-row justify-around mb-6">
              {[users.userA, users.userB].map((user, i) => (
                <View key={i} className="items-center">
                  <Image
                    source={{ uri: user?.photoURL }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                  <Text className="text-center mt-2 text-gray-700 dark:text-gray-200">
                    {user?.displayName}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-center text-gray-500 mb-4">
              Fetching user data...
            </Text>
          )}

          <View className="rounded-2xl p-6 border border-rose-100 dark:border-rose-800 w-full">
            <Text className="text-center text-gray-700 dark:text-gray-300">
              Connection established on{"\n"}
              {coupleData.createdAt?.toDate?.()?.toLocaleDateString() ||
                "Today"}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-8 pb-8">
      <GradientBackground />
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back" size={32} color="#FF6B8D" />
      </TouchableOpacity>
      <View className="items-center mb-12">
        <Text className="text-5xl font-bold text-rose-500 dark:text-rose-400 mb-2">
          Connect
        </Text>
        <Text className="text-xl text-rose-400 dark:text-rose-300 text-center">
          Connect with your partner to start your journey together
        </Text>
      </View>
      {/* Tab Selector */}
      <View className="flex-row mb-8">
        <TouchableOpacity
          onPress={() => setActiveTab("generate")}
          className={`flex-1 py-3 rounded-l-2xl ${
            activeTab === "generate"
              ? "bg-rose-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "generate"
                ? "text-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Generate Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("join")}
          className={`flex-1 py-3 rounded-r-2xl ${
            activeTab === "join"
              ? "bg-rose-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "join"
                ? "text-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Join with Code
          </Text>
        </TouchableOpacity>
      </View>
      {/* Generate Code Tab */}
      {activeTab === "generate" && (
        <View className="space-y-6">
          <LinearGradient
            colors={["rgba(255, 200, 200, 0.9)", "rgba(255, 245, 247, 0.8)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden p-6 border border-rose-100 dark:border-rose-800"
          >
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Generate Connection Code
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-4">
              Create a unique code that your partner can use to connect with
              you. The code expires in 60 minutes.
            </Text>

            {connectionCode ? (
              <View className="items-center">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Your Connection Code:
                </Text>
                <View className="bg-rose-50 dark:bg-rose-900 px-6 py-4 rounded-xl overflow-hidden">
                  <Text className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-widest">
                    {connectionCode}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Share this code with your partner
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={generateConnectionCode}
                disabled={loading}
                className="overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={["#ff6b9d", "#ffa07a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className={`rounded-xl overflow-hidden py-4 ${
                    loading ? "opacity-50" : ""
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center text-lg font-semibold">
                      Generate Code
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      )}
      {/* Join Code Tab */}
      {activeTab === "join" && (
        <View className="space-y-6">
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 245, 247, 0.8)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6 border border-rose-100 dark:border-rose-800"
          >
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Join with Connection Code
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-4">
              Enter the connection code shared by your partner to connect your
              accounts.
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Connection Code
                </Text>
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.9)",
                    "rgba(255, 245, 247, 0.8)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-xl border border-rose-100 dark:border-rose-800"
                >
                  <TextInput
                    className="px-4 py-4 text-gray-800 dark:text-gray-200 text-lg text-center tracking-widest"
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9CA3AF"
                    value={inputCode}
                    onChangeText={(text) => setInputCode(text.toUpperCase())}
                    maxLength={6}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </LinearGradient>
              </View>

              <TouchableOpacity
                onPress={joinWithConnectionCode}
                disabled={loading || !inputCode.trim()}
              >
                <LinearGradient
                  colors={["#ff6b9d", "#ffa07a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className={`rounded-xl py-4 ${
                    loading || !inputCode.trim() ? "opacity-50" : ""
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center text-lg font-semibold">
                      Connect
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
      {/* Info Section */}
      <View className="mt-8">
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.7)", "rgba(255, 245, 247, 0.6)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-4 border border-rose-100 dark:border-rose-800"
        >
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Once connected, you will be able to share thoughts, track your
            relationship, and stay close no matter the distance.
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

export default ConnectScreen;
