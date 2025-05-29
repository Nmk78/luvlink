import { useGradients } from "@/hooks/provider/gradientProvider";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";

export default function GradientBackground() {
const gradient = useGradients()

  return (
    <View className="absolute top-0 left-0 right-0 h-80 flex flex-col">
      <LinearGradient
        colors={[...gradient, "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      />
    </View>
  );
}
