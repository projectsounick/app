import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, View, Text, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";
import theme from "./Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

import { router } from "expo-router";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { useNavigation } from "@react-navigation/native";
const SecondSplashScreen = () => {
  const progress = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const combinedTranslateX = useRef(new Animated.Value(0)).current;
  const [showLetters, setShowLetters] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState("");
  const [showCircle, setShowCircle] = useState(true);

  const navigation = useNavigation<any>();
  const CIRCLE_RADIUS = 80;
  const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

  useEffect(() => {
    const runAnimation = async () => {
      let response = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
        "user"
      );

      // Animate Circle Progress
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }).start(() => {
        // After circle completes, hide it
        setShowCircle(false);

        // Show Logo
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          // Move Logo + Text left slightly
          Animated.timing(combinedTranslateX, {
            toValue: -40,
            duration: 800,
            useNativeDriver: true,
          }).start(() => {
            // Show Letters one by one
            setShowLetters(true);
            animateLetters();
          });
        });
      });
    };

    runAnimation();
  }, []);

  const animateLetters = () => {
    const fullText = "INESS";
    let currentText = "";

    fullText.split("").forEach((letter, index) => {
      setTimeout(() => {
        currentText += letter;
        setVisibleLetters(currentText);

        // When all letters are shown, navigate
        if (index === fullText.length - 1) {
          setTimeout(() => {
            router.replace("/(tabs)/dashboard/tabs");
          }, 500); // slight delay after last letter
        }
      }, index * 300);
    });
  };

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
