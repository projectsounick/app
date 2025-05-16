import theme from "@/app/Theme/globalTheme";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
interface BotterBarInterface {
  onSubmit: () => void;
}
///// Mainf functional component for the bottom bar ----------------------------/
const BottomBar = ({ onSubmit }: BotterBarInterface) => {
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#4B0082",
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 40,
        }}
        onPress={onSubmit}
      >
        <Text
          style={{
            fontWeight: "700",
            color: "#000",
            fontSize: 16,
          }}
        >
          ₹1200
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontWeight: "700",
              color: "#000",
              fontSize: 16,
              marginRight: 4,
            }}
          >
            Add to Cart
          </Text>
          <Icon name="chevron-right" size={18} color="#000" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default BottomBar;
