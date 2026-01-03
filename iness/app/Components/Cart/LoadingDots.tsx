import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import theme from "@/app/Theme/globalTheme";

const AnimatedDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={{ color: theme.colors.black, fontSize: theme.fontSizes.regular, fontWeight: theme.fontWeights.bold as "700" }}>
      Loading{dots}
    </Text>
  );
};

export default AnimatedDots;
