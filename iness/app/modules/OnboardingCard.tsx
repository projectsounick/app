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
          backgroundColor: "#FFFFFF",
          height,
          marginBottom: 16,
          borderRadius: 20,
          flexDirection: icon || description ? "row" : "column",
          alignItems: "center",
          justifyContent: icon || description ? "flex-start" : "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? "#9747FF" : "#F5F5F5",
        }}
      >
        {/* Icon if exists */}
        {icon && (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F0F0F0",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color="#9747FF"
            />
          </View>
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
              fontSize: fontSize ? fontSize : 20,
              fontWeight: "600",
              color: "#000",
              textAlign: icon || description ? "left" : "center",
            }}
          >
            {option}
          </Text>

          {description && (
            <Text
              style={{
                marginTop: 4,
                fontSize: 14,
                color: "#666",
                fontWeight: "400",
                textAlign: "left",
                lineHeight: 20,
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
