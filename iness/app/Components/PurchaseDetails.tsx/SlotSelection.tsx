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
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#9747FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Icon name="clock" size={18} color="#FFFFFF" />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#000",
          }}
        >
          Available Slots
        </Text>
      </View>

      {/* Slot buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          flexWrap: "wrap",
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        }}
      >
        {visibleSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectSlot(slot)}
            style={{
              backgroundColor:
                selectedSlot === slot ? "#9747FF" : "#F8F8F8",
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 16,
              borderWidth: 2,
              borderColor:
                selectedSlot === slot ? "#9747FF" : "transparent",
              minWidth: 110,
              alignItems: "center",
              shadowColor: selectedSlot === slot ? "#9747FF" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selectedSlot === slot ? 0.3 : 0,
              shadowRadius: 4,
              elevation: selectedSlot === slot ? 3 : 0,
            }}
          >
            <Text
              style={{
                color: selectedSlot === slot ? "#FFFFFF" : "#333",
                fontSize: 13,
                fontWeight: "600",
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
            marginTop: 12,
            alignSelf: "flex-end",
            paddingVertical: 6,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: "#9747FF",
              fontSize: 14,
              fontWeight: "600",
              marginRight: 4,
            }}
          >
            {isExpanded ? "Show less" : "Show all"}
          </Text>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#9747FF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SlotSelectionSection;
