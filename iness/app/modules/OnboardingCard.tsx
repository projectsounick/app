import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { OnboardingCardInterface } from "../interfaces/onboardingInterface";
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function OnboardingCard({
  index,
  option,
  state,
  updateState,
  height,
  icon,
  description,
  style,
  fontSize,
}: OnboardingCardInterface) {
  const isSelected = Array.isArray(state)
    ? state.includes(option)
    : state === option;

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      delay: index * 100, // staggered delay
      useNativeDriver: true,
    }).start();

    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity
        onPress={() => updateState(option)}
        activeOpacity={0.9}
        style={{
          backgroundColor: "#fff",
          height,
          marginBottom: 18,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? theme.colors.secondPrimary : "transparent",
          borderRadius: 12,
          flexDirection: icon || description ? "row" : "column",
          alignItems: "center",
          justifyContent: icon || description ? "flex-start" : "center",
          paddingHorizontal: 12,

          elevation: 3, // Android shadow

          // iOS shadow:
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Icon if exists */}
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.secondPrimary}
            style={{
              marginRight: 12,
            }}
          />
        )}

        {/* Label + Description */}
        <View
          style={{
            flex: 1,
            alignItems: icon || description ? "flex-start" : "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: fontSize ? fontSize : 28,
              fontWeight: "600",
              color: theme.colors.dark,
              fontFamily: theme.fonts.bold,
              textAlign: icon || description ? "left" : "center",
            }}
          >
            {option}
          </Text>

          {description && (
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: theme.colors.grey,
                fontWeight: "400",
                textAlign: "left",
              }}
            >
              {description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
