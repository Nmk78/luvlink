import React from "react";
import { Dimensions, Text, View } from "react-native";

import Svg, { Path } from "react-native-svg";

export default function CurvedDashedLine({
  distance = -99, // Default to -99 if no distance is provided
}: {
  distance: number;
}) {
  const screenWidth = Dimensions.get("window").width;

  const avatarOffset = screenWidth/9;
  const startX = avatarOffset;
  const endX = screenWidth - avatarOffset;
  const controlX = screenWidth / 2;
  const controlY = -60; // Curve height upward
  const positionYofCurve = 30; // Higher the value, lower the curve

  const path = `M${startX},80 Q${controlX},${controlY} ${endX},80`;

  return (
    <View className="flex-1 items-center relative">
      <Svg
        height="100"
        width={screenWidth}
        style={{ position: "absolute", top: positionYofCurve }}
      >
        <Path
          d={path}
          stroke="#ff6b9d"
          strokeWidth={2}
          fill="none"
          strokeDasharray="5,5"
        />
      </Svg>
      {distance !== -99 && (
        <View
          className="p-4 bg-white px-2 py-1 rounded-2xl border border-pink-400 shadow"
          style={{
            shadowColor: "#333",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            position: "absolute",
            top: positionYofCurve,
          }}
        >
          <Text className="text-pink-400 font-semibold text-xs text-center">
            {distance} km
          </Text>
        </View>
      )}
    </View>
  );
}
