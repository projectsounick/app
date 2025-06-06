import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import SmallHeader from "@/app/modules/SmallHeader";
import { useRouter } from "expo-router";
import BackHeader from "@/app/modules/BackHeader";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get("window");

const PaymentSuccessScreen = () => {
  const progress = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const router = useRouter();
  const CIRCLE_RADIUS = 80;
  const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setShowContent(true);
      }, 2000);
    });
  }, []);

  useEffect(() => {
    if (showContent) {
      Animated.parallel([
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showContent]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_LENGTH, 0],
  });

  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require("../../../assets/images/basicBackground.jpeg")}
    >
      {/* Animated Circle */}
      {!showContent && (
        <View
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: [{ translateX: -100 }],
          }}
        >
          <Svg
            height="200"
            width="200"
            style={{ transform: [{ rotate: "-90deg" }] }}
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
        </View>
      )}

      {/* Confetti Animation */}
      {!showContent && (
        <LottieView
          source={require("../../../assets/splash.json")}
          autoPlay
          loop={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
          resizeMode="cover"
        />
      )}

      {/* Main Content */}
      {showContent && (
        <View style={{ flex: 1 }}>
          <SmallHeader title="Payment" />
          <BackHeader />
          <View style={{ marginTop: 40, alignItems: "center" }}>
            {/* Thank You Box */}
            <View
              style={{
                backgroundColor: "#E6FFF0",
                borderColor: "green",
                borderWidth: 1.5,
                borderRadius: 100,
                paddingVertical: 14,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "green",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Thank you! Payment successful.
              </Text>
            </View>

            {/* Animated Button */}
            <Animated.View
              style={{
                marginTop: 32,
                transform: [{ translateY: slideUpAnim }],
                opacity: opacityAnim,
                width: "80%",
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/dashboard/tabs")}
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 14,
                  borderRadius: 30,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.dark,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  See your plans
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}
    </ImageBackground>
  );
};

export default PaymentSuccessScreen;
