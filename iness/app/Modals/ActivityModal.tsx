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
        <LinearGradient
          colors={["#2C1453", "#1C0E33"]}
          style={{
            height: height * 0.7,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: 20,
            overflow: "hidden",
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 45,
              height: 5,
              backgroundColor: "rgba(255,255,255,0.4)",
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
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: 6,
              zIndex: 2,
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.textWhite} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontSize: theme.fontSizes.large,
              fontFamily: theme.fonts.bold,
              color: theme.colors.textWhite,
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
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.05)",
                  borderWidth: selectedActivity === cat.name ? 1 : 0,
                  borderColor:
                    selectedActivity === cat.name ? cat.color : "transparent",
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
                    color: theme.colors.textWhite,
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
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.regularSmall,
                    fontFamily: theme.fonts.medium,
                    color: theme.colors.textWhite,
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
                  placeholderTextColor="#ccc"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    borderRadius: 10,
                    padding: 10,
                    fontSize: theme.fontSizes.regular,
                    fontFamily: theme.fonts.regular,
                    color: theme.colors.textWhite,
                  }}
                />
              </View>
            )}

            {/* Add Button */}
            <TouchableOpacity
              onPress={handleAdd}
              style={{
                marginTop: 24,
                backgroundColor: theme.colors.primary,
                padding: 14,
                borderRadius: 20,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={20} color={theme.colors.black} />
              <Text
                style={{
                  color: theme.colors.black,
                  fontFamily: theme.fonts.bold,
                  fontSize: theme.fontSizes.regular,
                  marginLeft: 8,
                }}
              >
                Add Activity
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}
