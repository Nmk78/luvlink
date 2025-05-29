import { useGradients } from "@/hooks/provider/gradientProvider";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ActionButtonProps {
  onPress: () => void;
  loading?: boolean;
  text: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  loading = false,
  text,
  disabled = false,
  style,
}) => {
  // Pick a random gradient once when the component mounts
const gradient = useGradients();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className="px-4 py-2"
      style={[style, { opacity: loading || disabled ? 0.5 : 1 }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-2xl overflow-hidden py-4 px-4 shadow-lg"
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? <ActivityIndicator color="#fff" /> : text}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ActionButton;
