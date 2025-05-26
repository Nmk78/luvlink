import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ThoughtBubbleProps = {
  text: string;
  side: "left" | "right";
};

export default function ThoughtBubble({ text, side }: ThoughtBubbleProps) {
  const isLeft = side === "left";

  return (
    <View style={[styles.container, isLeft ? styles.left : styles.right]}>
      {/* Main bubble */}
      <View style={styles.bubble}>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.text}>
          {text}
        </Text>
      </View>

      {/* Trail dots */}
      <View
        style={[
          styles.dotLarge,
          isLeft ? styles.dotLeftLarge : styles.dotRightLarge,
        ]}
      />
      <View
        style={[
          styles.dotMedium,
          isLeft ? styles.dotLeftMedium : styles.dotRightMedium,
        ]}
      />
      <View
        style={[
          styles.dotSmall,
          isLeft ? styles.dotLeftSmall : styles.dotRightSmall,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -60,
    zIndex: 10,
  },
  left: { left: 40 },
  right: { right: 40 },

  bubble: {
    maxWidth: 180,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderColor: "#fce4ec",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },

  // Thought trail dots
  dotLarge: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fce4ec",
  },
  dotMedium: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fce4ec",
  },
  dotSmall: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fce4ec",
  },

  // Dot positions (Left)
  dotLeftLarge: { bottom: -8, left: 24 },
  dotLeftMedium: { bottom: -16, left: 18 },
  dotLeftSmall: { bottom: -22, left: 14 },

  // Dot positions (Right)
  dotRightLarge: { bottom: -8, right: 24 },
  dotRightMedium: { bottom: -16, right: 18 },
  dotRightSmall: { bottom: -22, right: 14 },
});
