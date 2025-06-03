import theme from "@/app/Theme/globalTheme";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface Props {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

const SlotSelectionSection: React.FC<Props> = ({
  slots,
  selectedSlot,
  onSelectSlot,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSlots = isExpanded ? slots : slots.slice(0, 3);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.secondPrimary,
        borderRadius: 12,
        padding: 16,
        backgroundColor: theme.colors.text,
        marginBottom: 16,
      }}
    >
      {/* Header with icon on right */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {" "}
        <Icon name="clock" size={20} color="#5E3AEE" />
        <Text
          style={{
            fontSize: theme.fontSizes.medium,
            color: theme.colors.dark,
            marginLeft: 6,
          }}
        >
          Available Slots
        </Text>
      </View>

      {/* Slot buttons */}
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {visibleSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectSlot(slot)}
            style={{
              backgroundColor:
                selectedSlot === slot ? theme.colors.primary : "#F3F4F6",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: selectedSlot === slot ? "#34D399" : "transparent",
              width: 150, // Fixed width for uniform size
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: selectedSlot === slot ? "#065F46" : "#000",
                fontSize: 12,
              }}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Expand/Collapse button */}
      {slots.length > 3 && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            alignSelf: "flex-end",
          }}
        >
          <Text style={{ color: "#5E3AEE", fontSize: 14, marginRight: 4 }}>
            {isExpanded ? "Show less" : "Show all"}
          </Text>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#5E3AEE"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SlotSelectionSection;
