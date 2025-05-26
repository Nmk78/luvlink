import CoupleAvatar from "@/components/CoupleAvatar";
import GradientBackground from "@/components/Gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
const Home = () => {
    const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, loading, router]);
  return (
    
    <View className="flex-1 flex-col items-center justify-start bg-white">

      <GradientBackground />
      <View className=" h-40 mt-28 items-center justify-center">
        <CoupleAvatar
          leftAvatar="https://i.pravatar.cc/150?img=10"
          rightAvatar="https://i.pravatar.cc/150?img=11"
          leftName="Nmk"
          rightName="Partner"
          leftThought="You're always on my mind"
          rightThought="Can't wait to see you ❤️"
          size="md"
        />
      </View>
    </View>
  );
};

export default Home;
