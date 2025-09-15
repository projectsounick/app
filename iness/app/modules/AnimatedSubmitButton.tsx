import React, { useEffect, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import theme from "../Theme/globalTheme";
import LoadingDots from "./LoadingDots";
import { AnimatedSubmitButtonProps } from "../interfaces/moduleInterfaces";
import { ActivityIndicator } from "react-native-paper";

const { width } = Dimensions.get("window");

const AnimatedSubmitButton: React.FC<AnimatedSubmitButtonProps> = ({
  loading,
  onPress,
  title = "Let’s Get Started",
  height,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current; // Start hidden

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 700, // ⏳ slower animation
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TouchableOpacity disabled={loading} onPress={onPress}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: theme.colors.primary,
          borderRadius: 40,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: width * 0.8,
          marginBottom: theme.spacing?.md || 16,
          alignSelf: "center",
          alignItems: "center",
          marginTop: 33,
          height: height,
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text
            style={{
              color: theme.colors.dark,
              textAlign: "center",
              fontWeight: theme.fontWeights?.bold,
              fontSize: 20,
            }}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedSubmitButton;
