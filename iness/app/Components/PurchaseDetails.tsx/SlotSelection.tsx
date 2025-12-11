import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import theme from "@/app/Theme/globalTheme";

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="clock" size={18} color="#9747FF" />
        </View>
        <Text style={styles.title}>Available Slots</Text>
      </View>

      {/* Slot buttons */}
      <View style={styles.slotsContainer}>
        {visibleSlots.map((slot, index) => {
          const isSelected = selectedSlot === slot;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectSlot(slot)}
              style={[
                styles.slotButton,
                isSelected && styles.slotButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  isSelected && styles.slotTextSelected,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Expand/Collapse button */}
      {slots.length > 3 && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandText}>
            {isExpanded ? "Show less" : "Show all"}
          </Text>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9747FF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  slotsContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  slotButton: {
    backgroundColor: "#F8F8F8",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    minWidth: 100,
    alignItems: "center",
  },
  slotButtonSelected: {
    backgroundColor: "#F3EDFF",
    borderColor: "#9747FF",
    borderWidth: 2,
  },
  slotText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  slotTextSelected: {
    color: "#9747FF",
    fontWeight: "600",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  expandText: {
    color: "#9747FF",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
    fontFamily: theme.fonts.medium,
  },
});

export default SlotSelectionSection;
