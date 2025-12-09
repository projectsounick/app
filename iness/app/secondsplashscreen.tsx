import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, View, Text, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";
import theme from "./Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
// Removed unused imports - navigation is handled in dashboard component

import { router } from "expo-router";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SecondSplashScreen = () => {
  const [progress] = useState(() => new Animated.Value(0));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [combinedTranslateX] = useState(() => new Animated.Value(0));

  const [showLetters, setShowLetters] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState("");
  const [showCircle, setShowCircle] = useState(true);
  const CIRCLE_RADIUS = 80;
  const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;
  const LETTER_DELAY = 300;
  const FULL_TEXT = "INESS";

  useEffect(() => {
    const runAnimation = async () => {
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      // Animate circle
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setShowCircle(false);

        // Fade in logo
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          // Slide logo
          Animated.timing(combinedTranslateX, {
            toValue: -40,
            duration: 800,
            useNativeDriver: true,
          }).start(() => {
            // Show letters
            setShowLetters(true);

            // Animate letters without worrying about navigation
            const FULL_TEXT = "INESS";
            const LETTER_DELAY = 300;
            let currentText = "";

            FULL_TEXT.split("").forEach((letter, index) => {
              setTimeout(() => {
                currentText += letter;
                setVisibleLetters(currentText);
              }, index * LETTER_DELAY);
            });

            // ⏳ Navigate after all animations
            const totalAnimationTime =
              2000 + 800 + FULL_TEXT.length * LETTER_DELAY;
            setTimeout(() => {
              router.replace("/(tabs)/dashboard/tabs");
              // Don't check for navigation here - let the dashboard component handle it
              // after it's fully loaded
            }, totalAnimationTime);
          });
        });
      });
    };

    runAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_LENGTH, 0],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Progress Circle */}
      {showCircle && (
        <Svg
          height="200"
          width="200"
          style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
        >
          <AnimatedCircle
            cx="100"
            cy="100"
            r={CIRCLE_RADIUS}
            stroke={theme.colors.primary}
            strokeWidth="10"
            fill="none"
            strokeDasharray={CIRCLE_LENGTH}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
      )}

      {/* Logo + Text together */}
      <Animated.View
        style={{
          width: 220, // Fixed width to help center during translation
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          transform: [{ translateX: combinedTranslateX }],
          opacity: logoOpacity,
        }}
      >
        <Image
          source={require("../assets/images/logo.webp")}
          style={{ width: 80, height: 80, resizeMode: "contain" }}
        />
        {showLetters && (
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: theme.colors.secondPrimary,
              marginLeft: 12,
            }}
          >
            {visibleLetters}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

export default SecondSplashScreen;
