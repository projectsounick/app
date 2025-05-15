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

const { width } = Dimensions.get("window");

const AnimatedSubmitButton: React.FC<AnimatedSubmitButtonProps> = ({
  loading,
  onPress,
  title = "Let’s Get Started",
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
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        backgroundColor: theme.colors.primary,
        borderRadius: 30,
        paddingVertical: 14,
        width: width * 0.8,
        marginBottom: theme.spacing?.md || 16,
        alignSelf: "center",
        marginTop: "5%",
      }}
    >
      <TouchableOpacity disabled={loading} onPress={onPress}>
        {loading ? (
          <LoadingDots />
        ) : (
          <Text
            style={{
              color: theme.colors.dark,
              textAlign: "center",
              fontWeight: theme.fontWeights?.bold || "bold",
              fontSize: theme.fontSizes?.medium || 16,
            }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedSubmitButton;
