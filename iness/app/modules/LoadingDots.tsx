import React, { useEffect, useRef } from "react";
import { Text, View, Animated } from "react-native";

//// Main functional component for the LoadingDots ///// -----------------------------------/
const LoadingDots = () => {
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot1Opacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate();
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 24,
        width: "100%", // ensures full width for centering
        backgroundColor: "blue",
      }}
    >
      {[dot1Opacity, dot2Opacity, dot3Opacity].map((opacity, idx) => (
        <Animated.Text
          key={idx}
          style={{
            opacity,
            fontSize: 20,
            marginHorizontal: 4,
            transform: [{ scale: 2 }],
            textAlign: "center",
          }}
        >
          .
        </Animated.Text>
      ))}
    </View>
  );
};

export default LoadingDots;
