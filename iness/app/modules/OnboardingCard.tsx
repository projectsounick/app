import React, { useEffect, useRef } from "react";
import {
  Animated,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { OnboardingCardInterface } from "../interfaces/onboardingInterface";
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
              size={24}
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
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
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
    marginTop: 4,
    fontSize: 13,
    color: "#888",
    fontFamily: theme.fonts.regular,
    lineHeight: 18,
  },
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginLeft: 10,
  },
});
