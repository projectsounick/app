import React from "react";
import { View, Text } from "react-native";

const PlansStatusCard = () => {
  const pending = 3;
  const completed = 3;
  const total = pending + completed;

  return (
    <View
      style={{
        flexDirection: "row",
        height: 69,

        marginTop: 16,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#A259FF",
          padding: 6,
          borderRadius: 12,
          marginHorizontal: 4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          Plans Pending
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {pending}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "#A259FF",
          padding: 6,
          borderRadius: 12,
          marginHorizontal: 4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          Plans completed
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {completed}
        </Text>
      </View>
    </View>
  );
};

export default PlansStatusCard;
