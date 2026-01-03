import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import theme from "../Theme/globalTheme";

interface OnboardingHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  icon?: string;
  step?: number;
  totalSteps?: number;
}

export default function OnboardingHeading({
  children,
  subtitle,
  icon,
  step,
  totalSteps,
}: OnboardingHeadingProps) {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color={theme.colors.secondPrimary} />
        </View>
      )}

      {/* Main Heading */}
      <Text style={styles.headingText}>{children}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}

      {/* Step indicator */}
      {step && totalSteps && (
        <View style={styles.stepContainer}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>
              Step {step} of {totalSteps}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headingText: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: theme.fontWeights.bold as "700",
    textAlign: "center",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    lineHeight: 36,
  },
  subtitleText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    fontFamily: theme.fonts.regular,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  stepContainer: {
    marginTop: 16,
  },
  stepBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.success,
    fontWeight: theme.fontWeights.medium as "500",
    fontFamily: theme.fonts.medium,
  },
});
