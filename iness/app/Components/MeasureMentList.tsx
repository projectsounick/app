import React, { memo } from "react";
import { FlatList, View, Text } from "react-native";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const iconMap: any = {
  Chest: "body-outline",
  Waist: "resize-outline",
  Thigh: "walk-outline",
  "Left Arm": "hand-left-outline",
  "Right Arm": "hand-right-outline",
};

const MeasurementList = ({ measurements }: { measurements: any[] }) => {
  return (
    <FlatList
      data={measurements}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={{ padding: 12, paddingBottom: 60 }}
      renderItem={({ item }) => (
        <Card
          style={{
            marginBottom: 10,
            borderRadius: 10,
            elevation: 1,
            backgroundColor: "#fdfdfd",
          }}
        >
          <Card.Content style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
            {[
              { label: "Chest", value: item.chest },
              { label: "Waist", value: item.waist },
              { label: "Thigh", value: item.thigh },
              { label: "Left Arm", value: item.armSizeLeft },
              { label: "Right Arm", value: item.armSizeRight },
            ].map(({ label, value }) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={iconMap[label] || "ellipse-outline"}
                    size={16}
                    color="#666"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#333" }}>{label}</Text>
                </View>
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#111" }}
                >
                  {value ?? "-"} cm
                </Text>
              </View>
            ))}

            <View style={{ alignItems: "flex-end", marginTop: 4 }}>
              <Text
                style={{
                  fontSize: 10,
                  color: "#aaa",
                  opacity: 0.7,
                }}
              >
                {new Date(item.date).toLocaleDateString("en-GB")}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}
    />
  );
};

export default memo(MeasurementList);
