import React, { useEffect, useState } from "react";
import { Text } from "react-native";

const AnimatedDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={{ color: "#000", fontSize: 16, fontWeight: "bold" }}>
      Loading{dots}
    </Text>
  );
};

export default AnimatedDots;
