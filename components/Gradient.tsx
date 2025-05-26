import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { View } from "react-native";


export default function GradientBackground() {

  return (

      <View className="absolute top-0 left-0 right-0 h-80 flex flxex-col">
        <LinearGradient
          colors={
            ["#ff6b9d", "#ffa07a", "transparent" ] // Light mode: pink to peach
          }
          start={{ x: 1, y: 0}}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        />
      </View>
  );
}
