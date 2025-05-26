
import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

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

  // const handleFormSubmit = async () => {
  //   try {
  //     console.log(isSignUp ? "🔐 Signing up..." : "🔓 Signing in...", {
  //       email,
  //     });

  //     let result;

  //     if (isSignUp) {
  //       result = await auth().createUserWithEmailAndPassword(email, password);
  //     } else {
  //       result = await auth().signInWithEmailAndPassword(email, password);
  //     }

  //     console.log("✅ Auth success:", result.user?.uid);
  //     router.replace("/(tabs)/index");
  //   } catch (err: any) {
  //     console.error("❌ Auth error:", err);
  //     Alert.alert(
  //       "Authentication Failed",
  //       err.message || "Something went wrong"
  //     );
  //   }
  // };

  const handleFormSubmit = async () => {
  try {
    console.log(isSignUp ? "🔐 Signing up..." : "🔓 Signing in...", { email });

    let result;

    if (isSignUp) {
      result = await auth().createUserWithEmailAndPassword(email, password);

      // After signup, create Firestore user doc
      await firestore().collection("users").doc(result.user.uid).set({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || "", // usually null for email/password
        photoURL: result.user.photoURL || "",
        coupleId: null,
        pronouns: "",
        relationshipLabel: "",
        joinedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log("📝 User document created in Firestore.");
    } else {
      result = await auth().signInWithEmailAndPassword(email, password);
    }

    console.log("✅ Auth success:", result.user?.uid);
    router.replace("/");
  } catch (err: any) {
    console.error("❌ Auth error:", err);
    Alert.alert("Authentication Failed", err.message || "Something went wrong");
  }
};

  // async function onGoogleButtonPress() {
  //   try {
  //     console.log("🔍 Attempting Google Sign-In...");

  //     await GoogleSignin.signOut(); // Clear previous session
  //     await GoogleSignin.hasPlayServices({
  //       showPlayServicesUpdateDialog: true,
  //     });

  //     const googleUser = await GoogleSignin.signIn();
  //     console.log("✅ Google user:", googleUser);

  //     const credential = auth.GoogleAuthProvider.credential(googleUser.idToken);

  //     const result = await auth().signInWithCredential(credential);
  //     console.log("✅ Firebase signed in with Google:", result.user?.uid);

  //     router.replace("/(tabs)/profile");
  //   } catch (error: any) {
  //     console.error("❌ Google Sign-In error:", error);
  //     Alert.alert(
  //       "Google Sign-In Failed",
  //       error.message || "Something went wrong"
  //     );
  //   }
  // }

  async function onGoogleButtonPress() {
  try {
    console.log("🔍 Attempting Google Sign-In...");

    await GoogleSignin.signOut(); // Clear previous session
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const googleUser = await GoogleSignin.signIn();
    console.log("✅ Google user:", googleUser);

    const credential = auth.GoogleAuthProvider.credential(googleUser.idToken);
    const result = await auth().signInWithCredential(credential);

    const user = result.user;

    // Check if the user already exists in Firestore
    const userDoc = await firestore().collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      await firestore().collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        coupleId: null,
        pronouns: "",
        relationshipLabel: "",
        joinedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log("📝 Google user added to Firestore.");
    } else {
      console.log("🔎 Google user already exists in Firestore.");
    }

    console.log("✅ Firebase signed in with Google:", user.uid);
    router.replace("/(tabs)/profile");
  } catch (error: any) {
    console.error("❌ Google Sign-In error:", error);
    Alert.alert("Google Sign-In Failed", error.message || "Something went wrong");
  }
}


  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
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
        onPress={handleFormSubmit}
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
