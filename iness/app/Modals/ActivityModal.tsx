import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { height } = Dimensions.get("window");

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onAddActivity: (activity: string, duration: number) => void;
}

const ACTIVITY_CATEGORIES = [
  { name: "Running", color: "#FF6B6B", icon: "walk" },
  { name: "Yoga", color: "#4ECDC4", icon: "fitness" },
  { name: "Weight Training", color: "#FFD93D", icon: "barbell" },
  { name: "Walking", color: "#5D5FEF", icon: "walk-outline" },
  { name: "Swimming", color: "#48BFE3", icon: "water" },
];

export default function AddActivityModal({
  visible,
  onClose,
  onAddActivity,
}: AddActivityModalProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("");

  const handleAdd = () => {
    if (!selectedActivity || !duration) return;
    onAddActivity(selectedActivity, Number(duration));
    setSelectedActivity(null);
    setDuration("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            height: height * 0.7,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: 20,
            overflow: "hidden",
            backgroundColor: theme.colors.background,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 45,
              height: 5,
              backgroundColor: theme.colors.border,
              borderRadius: 3,
              alignSelf: "center",
              marginTop: 4,
              marginBottom: 10,
            }}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 20,
              backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.border,
              borderRadius: 20,
              padding: 6,
              zIndex: 2,
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontSize: theme.fontSizes.large,
              fontFamily: theme.fonts.bold,
              color: theme.colors.text,
              marginBottom: 20,
            }}
          >
            Add Activity
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Activity Options */}
            {ACTIVITY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                  backgroundColor:
                    selectedActivity === cat.name
                      ? isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight
                      : isDark ? theme.colors.backgroundSecondary : theme.colors.backgroundSecondary,
                  borderWidth: selectedActivity === cat.name ? 1 : 0,
                  borderColor:
                    selectedActivity === cat.name ? cat.color : theme.colors.border,
                }}
                onPress={() => setSelectedActivity(cat.name)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={24}
                  color={cat.color}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    fontFamily: theme.fonts.medium,
                    color: theme.colors.text,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Duration Input */}
            {selectedActivity && (
              <View
                style={{
                  marginTop: 20,
                  padding: 14,
                  backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.regularSmall,
                    fontFamily: theme.fonts.medium,
                    color: theme.colors.text,
                    marginBottom: 6,
                  }}
                >
                  Enter Duration (minutes)
                </Text>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="e.g., 45"
                  placeholderTextColor={theme.colors.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    padding: 10,
                    fontSize: theme.fontSizes.regular,
                    fontFamily: theme.fonts.regular,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                />
              </View>
            )}

            {/* Add Button */}
            <TouchableOpacity
              onPress={handleAdd}
              style={{
                marginTop: 24,
                backgroundColor: theme.colors.success,
                padding: 14,
                borderRadius: 20,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={20} color={theme.colors.textWhite} />
              <Text
                style={{
                  color: theme.colors.textWhite,
                  fontFamily: theme.fonts.bold,
                  fontSize: theme.fontSizes.regular,
                  marginLeft: 8,
                }}
              >
                Add Activity
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
