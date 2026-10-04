import { safeRouter } from "@/src/utils/safeRouter";
import React from "react";
import { useNavigation } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import { Text } from "react-native-paper";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";

///// Main funcitonal component for the back header --------------/
export default function BackHeader() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          padding: 19,
        }}
      >
        <TouchableOpacity onPress={() => safeRouter.back()}>
          <Icon name="chevron-left" size={24} color={isDark ? theme.colors.textWhite : theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: theme.fontSizes.regular,
            fontWeight: theme.fontWeights.medium as "500",
            marginLeft: 10,
            color: isDark ? theme.colors.textWhite : theme.colors.text,
            fontFamily: theme.fonts.medium,
          }}
        >
          Continue Exploring
        </Text>
      </View>
    </>
  );
}
