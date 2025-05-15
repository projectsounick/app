import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const { width } = Dimensions.get("window");

const Tab = createBottomTabNavigator();

export default function TrainScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Header */}
      <Animated.View
        style={{
          height: headerHeight,
          opacity: headerOpacity,
          backgroundColor: "#6C1B9B",
          paddingHorizontal: 20,
          paddingTop: 40,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          Namaste Sunny! 🙏
        </Text>
        <Text style={{ color: "white", marginTop: 4 }}>
          Get ready to crush your fitness goals today.
        </Text>
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "#fff", marginVertical: 2 }}>0h/10h</Text>
          <Text style={{ color: "#fff", marginVertical: 2 }}>0g/10g</Text>
          <Text style={{ color: "#fff", marginVertical: 2 }}>0k/70k</Text>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 150,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Card 1 */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
            Train
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Corporate Wellness Program | 50% Off
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#38C172",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Know more</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
