import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

////// Main functional component for the Small header ----------------------------/
export default function SmallHeader({ title }: any) {
  const router = useRouter();
  console.log(title);

  return (
    <View
      style={{
        backgroundColor: "#6C1B9B",
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* Left: Profile & Info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",

          width: "33%",
        }}
      >
        <Image
          source={require("../../assets/images/favicon.png")}
          style={{
            width: 30,
            height: 30,
            borderRadius: 20,
            marginRight: 2,
          }}
        />
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Feather name="arrow-up-right" size={14} color="lightgreen" />
            <Text style={{ color: "white", fontSize: 14, marginHorizontal: 4 }}>
              79 kgs
            </Text>
            <Feather name="check-circle" size={14} color="lightgreen" />
          </View>
        </View>
      </View>
      <View style={{ width: "33%" }}>
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 22,
            textAlign: "center",
          }}
        >
          {title ? title : "Iness TV"}
        </Text>
      </View>
      {/* Right: Icons */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          width: "33%",
          justifyContent: "flex-end",
        }}
      >
        {/* Cart */}
        <TouchableOpacity
          style={{
            backgroundColor: "#4B0E75",
            borderRadius: 20,
            padding: 8,
            position: "relative",
          }}
        >
          <Feather
            name="shopping-cart"
            size={16}
            color="white"
            onPress={() => router.push("/dashboard/cart")}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "red",
              position: "absolute",
              top: 6,
              right: 6,
            }}
          />
        </TouchableOpacity>

        {/* Bell */}
        <TouchableOpacity
          style={{
            backgroundColor: "#4B0E75",
            borderRadius: 20,
            padding: 8,
            position: "relative",
          }}
        >
          <Feather
            name="bell"
            size={16}
            color="white"
            onPress={() => router.push("/dashboard/notification")}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "red",
              position: "absolute",
              top: 6,
              right: 6,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
