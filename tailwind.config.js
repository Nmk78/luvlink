/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6FB5",
        primaryDark: "#E85A9E",
        secondary: "#FFD3E0",
        accent: "#A66CFF",
        background: "#FFF1F7",
        darkBackground: "oklch(12.9% 0.042 264.695)",
        surface: "#FFFFFF",
        text: "#2B2B2B",
        textSecondary: "#666666",
        success: "#6EDC9B",
        error: "#FF6B6B",
        loveGlow: "#ff6fb5",
      },
      gradient: {
        romantic: ["#FF6FB5", "#A66CFF"],
      },
      radius: {
        sm: 8,
        md: 16,
        lg: 32,
      },
      shadow: {
        card: {
          shadowColor: "#FF6FB5",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
        },
      },
    },
  },
  plugins: [],
};
