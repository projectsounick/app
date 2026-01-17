import React, { useEffect, useRef } from "react";
import {
  Animated,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { OnboardingCardInterface } from "../interfaces/onboardingInterface";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

export default function OnboardingCard({
  index,
  option,
  state,
  updateState,
  height = 64,
  icon,
  description,
  fontSize = 16,
}: OnboardingCardInterface) {
  const theme = useGlobalTheme();
  const isSelected = Array.isArray(state)
    ? state.includes(option)
    : state === option;

  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const styles = getStyles(theme, isSelected);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale: scaleAnim }],
        opacity,
      }}
    >
      <TouchableOpacity
        onPress={() => updateState(option)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.card, { minHeight: height }]}
      >
        {/* Icon Container */}
        {icon && (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={isSelected ? theme.colors.success : theme.colors.textSecondary}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.label, { fontSize }]}>
            {option}
          </Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>

        {/* Selection Indicator */}
        <View style={styles.checkContainer}>
          {isSelected && (
            <MaterialCommunityIcons 
              name="check" 
              size={14} 
              color="#FFFFFF" 
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const getStyles = (theme: any, isSelected: boolean) => StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: isSelected ? theme.colors.greenLight : theme.colors.background,
    borderWidth: 2,
    borderColor: isSelected ? theme.colors.success : theme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: isSelected 
      ? `${theme.colors.success}20` 
      : theme.colors.backgroundSecondary,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
    color: isSelected ? theme.colors.text : theme.colors.text,
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    lineHeight: 18,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginLeft: 12,
    backgroundColor: isSelected ? theme.colors.success : "transparent",
    borderColor: isSelected ? theme.colors.success : theme.colors.border,
  },
});
