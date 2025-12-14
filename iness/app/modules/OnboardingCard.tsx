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
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

export default function OnboardingCard({
  index,
  option,
  state,
  updateState,
  height = 80,
  icon,
  description,
  fontSize = 18,
}: OnboardingCardInterface) {
  const isSelected = Array.isArray(state)
    ? state.includes(option)
    : state === option;

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
        style={[
          styles.card,
          {
            height,
            borderColor: isSelected ? "#9747FF" : "#F0F0F0",
            borderWidth: isSelected ? 2 : 1,
            backgroundColor: isSelected ? "#FAFAFF" : "#FFFFFF",
          },
        ]}
      >
        {/* Icon Container */}
        {icon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isSelected ? "#F3EDFF" : "#F8F8F8",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={Math.min(screenWidth * 0.06, 20)}
              color={isSelected ? "#9747FF" : "#666"}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.label,
              {
                fontSize,
                color: isSelected ? "#1A1A1A" : "#333",
              },
            ]}
          >
            {option}
          </Text>

          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>

        {/* Selection Indicator */}
        <View
          style={[
            styles.checkContainer,
            {
              backgroundColor: isSelected ? "#9747FF" : "#F0F0F0",
              borderColor: isSelected ? "#9747FF" : "#E0E0E0",
            },
          ]}
        >
          {isSelected && (
            <MaterialCommunityIcons 
              name="check" 
              size={Math.min(screenWidth * 0.04, 14)} 
              color="#FFFFFF" 
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Math.min(screenWidth * 0.035, 12),
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Math.min(screenWidth * 0.04, 14),
    paddingVertical: Math.min(screenWidth * 0.03, 10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: Math.min(screenWidth * 0.12, 42),
    height: Math.min(screenWidth * 0.12, 42),
    borderRadius: Math.min(screenWidth * 0.035, 12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: Math.min(screenWidth * 0.035, 12),
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
  },
  description: {
    marginTop: 3,
    fontSize: Math.max(screenWidth * 0.03, 12),
    color: "#888",
    fontFamily: theme.fonts.regular,
    lineHeight: Math.max(screenWidth * 0.045, 16),
  },
  checkContainer: {
    width: Math.min(screenWidth * 0.065, 24),
    height: Math.min(screenWidth * 0.065, 24),
    borderRadius: Math.min(screenWidth * 0.0325, 12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginLeft: Math.min(screenWidth * 0.025, 8),
  },
});
