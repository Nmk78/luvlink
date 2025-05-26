// hooks/useAuth.ts
import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

export function useAuth() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<null | any>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading: initializing };
}
