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
          <Icon name="clock" size={18} color={theme.colors.secondPrimary} />
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
            color={theme.colors.secondPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
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
    backgroundColor: theme.colors.darkGrey,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    minWidth: 100,
    alignItems: "center",
  },
  slotButtonSelected: {
    backgroundColor: theme.colors.backgroundCardLight,
    borderColor: theme.colors.secondPrimary,
    borderWidth: 2,
  },
  slotText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    fontFamily: theme.fonts.medium,
  },
  slotTextSelected: {
    color: theme.colors.secondPrimary,
    fontWeight: theme.fontWeights.medium as "500",
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
    color: theme.colors.secondPrimary,
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    marginRight: 4,
    fontFamily: theme.fonts.medium,
  },
});

export default SlotSelectionSection;
