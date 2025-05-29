import { getRandomGradient } from "@/utils/gradientPicker";
import React, { createContext, useContext, useMemo } from "react";

const GradientContext = createContext<[string, string]>(["#ff6b9d", "#ffa07a"]);

export const useGradients = () => useContext(GradientContext);

export const GradientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gradient = useMemo(() => getRandomGradient(), []);
  return (
    <GradientContext.Provider value={gradient}>
      {children}
    </GradientContext.Provider>
  );
};
