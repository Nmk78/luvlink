import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

const auth = getAuth();
const firestore = getFirestore();

GoogleSignin.configure({
  webClientId:
    "929778893441-jriihsvrvs1d0tmkiin8o3iilpbopro8.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

const AuthComponent = () => {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);

  const handleFormSubmit = async (
    email: string,
    password: string,
    isSignUp: boolean
  ): Promise<void> => {
    try {
      console.log(isSignUp ? "🔐 Signing up..." : "🔓 Signing in...", {
        email,
      });

      let result:
        | Awaited<ReturnType<typeof createUserWithEmailAndPassword>>
        | Awaited<ReturnType<typeof signInWithEmailAndPassword>>;

      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(firestore, "users", result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName:
            result.user.displayName || result.user.email?.split("@")[0],
          photoURL: result.user.photoURL || "",
          coupleId: null,
          pronouns: "",
          relationshipLabel: "",
          joinedAt: serverTimestamp(),
        });

        console.log("📝 User document created in Firestore.");
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }

      console.log("✅ Auth success:", result.user?.uid);
      router.replace("/");
    } catch (err: unknown) {
      console.error("❌ Auth error:", err);
      Alert.alert(
        "Authentication Failed",
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong"
      );
    }
  };

  async function onGoogleButtonPress() {
    try {
      console.log("🔍 Attempting Google Sign-In...");

      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const googleUser = await GoogleSignin.signIn();
      console.log("✅ Google user:", googleUser);

      //@ts-ignore
      const idToken = googleUser.idToken;
      if (!idToken) throw new Error("Google Sign-In failed: Missing ID token.");
      console.log("🔑 Google ID Token:", idToken);
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      const user = result.user;

      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0],
          photoURL: user.photoURL || "",
          coupleId: null,
          pronouns: "",
          relationshipLabel: "",
          joinedAt: serverTimestamp(),
        });
        console.log("📝 Google user added to Firestore.");
      } else {
        console.log("🔎 Google user already exists in Firestore.");
      }

      console.log("✅ Firebase signed in with Google:", user.uid);
      router.replace("/(tabs)/profile");
    } catch (err) {
      console.error("❌ Google Sign-In error:", err);
      Alert.alert(
        "Google Sign-In Failed",
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong"
      );
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("👤 Auth state changed:", user?.uid || "No user");

      if (user) {
        router.replace("/");
      }
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isSignUp ? "Sign Up" : "Sign In"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        onPress={() => handleFormSubmit(email, password, isSignUp)}
      />

      <Button
        title={
          isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"
        }
        onPress={() => setIsSignUp(!isSignUp)}
      />

      <Button
        title="Sign In with Google"
        color="#4285F4"
        onPress={() => onGoogleButtonPress()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default AuthComponent;
