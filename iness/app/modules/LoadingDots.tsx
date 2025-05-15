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
        alignItems: "center",
        justifyContent: "center",
        height: 24, // controls button height
      }}
    >
      <Animated.Text
        style={{
          opacity: dot1Opacity,
          fontSize: 40,
          lineHeight: 24,
          marginHorizontal: 1,
          paddingTop: 2,
        }}
      >
        .
      </Animated.Text>
      <Animated.Text
        style={{
          opacity: dot2Opacity,
          fontSize: 40,
          lineHeight: 24,
          marginHorizontal: 1,
          paddingTop: 2,
        }}
      >
        .
      </Animated.Text>
      <Animated.Text
        style={{
          opacity: dot3Opacity,
          fontSize: 40,
          lineHeight: 24,
          marginHorizontal: 1,
          paddingTop: 2,
        }}
      >
        .
      </Animated.Text>
    </View>
  );
};

export default LoadingDots;
