import React from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Text } from "react-native-paper";
import theme from "../Theme/globalTheme";

///// Main funcitonal component for the back header --------------/
export default function BackHeader() {
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 10,
            color: "#000",
            fontFamily: theme.fonts.medium,
          }}
        >
          Continue Exploring
        </Text>
      </View>
    </>
  );
}
