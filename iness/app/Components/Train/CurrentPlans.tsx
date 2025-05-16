import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

const CurrentPlans = () => {
  const planText = "HIIT cardio & crossfit\ndynamic workout session.";
  const imageUrl = require("../../../assets/images/track.png"); // Replace with your local asset if needed

  return (
    <View>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginRight: 8 }}>
            Plans Available
          </Text>
          <View
            style={{
              height: 1,
              width: 80,
              backgroundColor: "black",
              marginTop: 2,
            }}
          />
        </View>
        <Text style={{ color: "#3A8DFF", fontWeight: "500" }}>Help</Text>
      </View>

      {/* Plan Cards */}
      {[1, 2].map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: "#A259FF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Left side: text and button */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 16, color: "white" }}>✅</Text>
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  marginLeft: 8,
                  fontSize: 14,
                }}
              >
                {planText}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#C6FF69",
                paddingVertical: 8,
                paddingHorizontal: 28,
                borderRadius: 30,
                alignSelf: "flex-start",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "black", fontWeight: "600" }}>Start</Text>
            </TouchableOpacity>
          </View>

          {/* Right side: image */}
          <Image
            source={require("../../../assets/images/track.png")}
            style={{
              width: 80,
              height: 100,
              resizeMode: "contain",
              marginLeft: -10,
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default CurrentPlans;
