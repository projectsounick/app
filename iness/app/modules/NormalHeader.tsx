////// Main functional component for the profile screen --------------------------------------/
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";

import { router } from "expo-router";

///// Main function for the Normal Header ----------------------------------/
export default function NormalHeader({ screenName }: any) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.dark,
          borderRadius: 20,
          padding: 8,
          marginRight: 10,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={theme.colors.text}
          onPress={() => router.back()}
        />
      </TouchableOpacity>
      <Text
        style={{ fontSize: 22, fontWeight: "bold", color: theme.colors.dark }}
      >
        {screenName}
      </Text>
    </View>
  );
}
