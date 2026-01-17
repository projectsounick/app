import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useGlobalTheme } from "../Theme/ThemeContext";

interface OnboardingHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  icon?: string;
}

export default function OnboardingHeading({
  children,
  subtitle,
  icon,
}: OnboardingHeadingProps) {
  const theme = useGlobalTheme();
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const styles = getStyles(theme);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={28} 
            color={theme.colors.success} 
          />
        </View>
      )}

      {/* Main Heading */}
      <Text style={styles.headingText}>{children}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </Animated.View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headingText: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    lineHeight: 34,
  },
  subtitleText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    fontFamily: theme.fonts.regular,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
