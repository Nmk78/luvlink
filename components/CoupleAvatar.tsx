import { Image, View } from "react-native";
import CurvedDashedLine from "./CurveDashLine";

import { Ionicons } from "@expo/vector-icons";
import ThoughtBubble from "./ThoughBubble";

interface CoupleAvatarProps {
  leftAvatar: string;
  rightAvatar: string;
  leftName?: string;
  rightName?: string;
  leftThought?: string | null;
  rightThought?: string | null;
  size?: "sm" | "md" | "lg";
}

export default function CoupleAvatar({
  leftAvatar,
  rightAvatar,
  leftName,
  rightName,
  leftThought,
  rightThought,
  size = "md",
}: CoupleAvatarProps) {
  const sizeClasses = {
    sm: {
      container: "w-4/5 h-12",
      avatar: "w-12 h-12",
      // overlap: "-mr-3",
      text: "text-xs",
      thoughtBubble: "px-3 py-2",
      thoughtText: "text-sm",
    },
    md: {
      container: "w-4/5 h-24",
      avatar: "w-24 h-24",
      // overlap: "-mr-4",
      text: "text-sm",
      thoughtBubble: "px-4 py-3",
      thoughtText: "text-base",
    },
    lg: {
      container: "w-4/5 h-30",
      avatar: "w-30 h-30",
      // overlap: "-mr-5",
      text: "text-base",
      thoughtBubble: "px-5 py-4",
      thoughtText: "text-lg",
    },
  };

  const currentSize = sizeClasses[size];

  const getAvatarSource = (avatar: string) => {
    if (!avatar) {
      console.warn("Avatar is empty. Using default.");
      return require("../assets/images/default-avatar.png");
    }

    // Remote image (URL)
    if (avatar.startsWith("http") || avatar.startsWith("file")) {
      return { uri: avatar };
    }

    // Default fallback for any other value
    return require("../assets/images/default-avatar.png");
  };

  return (
    <View className=" flex items-center justify-center relative">
      {/* Couple avatars container */}

      <View className="mt-10 relative flex-col items-center  justify-center">
        <CurvedDashedLine distance={30} />

        {/* Avatar Container */}
        <View
          className={`${currentSize.container} relative flex flex-row items-center justify-between mt-20`}
        >
          {/* Left avatar */}
          <View className="relative">
            {leftThought && <ThoughtBubble text="Me too!" side="right" />}

            <View
              className={`${currentSize.avatar} rounded-full border-4 border-blue-500 bg-gray-200 overflow-hidden`}
            >
              <Image
                source={getAvatarSource(leftAvatar)}
                resizeMode="cover"
                className="w-full h-full"
                onError={(error) =>
                  console.log("Left image error:", error.nativeEvent?.error)
                }
                onLoad={() => console.log("Left image loaded successfully")}
              />
            </View>
          </View>

          <Ionicons name="pulse" size={24} color="#ff6b9d" />

          {/* Right avatar */}
          <View className="relative">
            {rightThought && (
              <ThoughtBubble text="Thinking of you too!" side="left" />
            )}
            <View
              className={`${currentSize.avatar} rounded-full border-4 border-red-500 bg-gray-200 overflow-hidden`}
            >
              <Image
                source={getAvatarSource(rightAvatar)}
                resizeMode="cover"
                className="w-full h-full"
                onError={(error) =>
                  console.log("Left image error:", error.nativeEvent?.error)
                }
                onLoad={() => console.log("Left image loaded successfully")}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
