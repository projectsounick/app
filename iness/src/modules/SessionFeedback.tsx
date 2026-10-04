import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../Theme/globalTheme";
const { height } = Dimensions.get("window");

const options = [
  { icon: "emoticon-happy-outline", label: "Good" },
  { icon: "star-circle-outline", label: "Excellent" },
  { icon: "emoticon-sad-outline", label: "Not satisfied" },
  { icon: "comment-text-outline", label: "Other" },
];

const FeedbackPanel = ({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState("");

  const handleSelect = (label: string) => {
    setSelectedOption(label);
    if (label !== "Other") setCustomFeedback("");
  };

  if (!visible) return null; // ✅ only render when visible

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        maxHeight: height * 0.7,
        zIndex: 999, // ✅ keep it above other UI
        elevation: 10, // for Android shadow
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
      }}
    >
      {/* Header */}
      <Text style={{ fontSize: theme.fontSizes.medium, fontWeight: theme.fontWeights.bold as "700", marginBottom: 16 }}>
        Give your feedback
      </Text>

      {/* Options */}
      <ScrollView
        style={{ maxHeight: 250 }}
        showsVerticalScrollIndicator={false}
      >
        {options.map((opt) => (
          <Pressable
            key={opt.label}
            onPress={() => handleSelect(opt.label)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
              paddingHorizontal: 8,
            }}
          >
            <MaterialCommunityIcons
              name={opt.icon as any}
              size={24}
              color={theme.colors.textSecondary}
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: theme.fontSizes.regular, flex: 1 }}>{opt.label}</Text>
            <View
              style={{
                height: 18,
                width: 18,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: theme.colors.textSecondary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {selectedOption === opt.label && (
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.textSecondary,
                  }}
                />
              )}
            </View>
          </Pressable>
        ))}

        {selectedOption === "Other" && (
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 6,
              padding: 10,
              marginTop: 12,
              fontSize: theme.fontSizes.regularSmall,
            }}
            placeholder="Write your feedback..."
            value={customFeedback}
            onChangeText={setCustomFeedback}
            multiline
          />
        )}
      </ScrollView>

      {/* Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 20,
          gap: 10,
        }}
      >
        <Pressable
          onPress={onClose}
          style={{
            backgroundColor: theme.colors.errorLight,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: theme.colors.error, fontWeight: theme.fontWeights.medium as "500" }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            onSubmit(
              selectedOption === "Other" ? customFeedback : selectedOption || ""
            )
          }
          style={{
            backgroundColor: theme.colors.greenLight,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: theme.colors.success, fontWeight: theme.fontWeights.medium as "500" }}>Submit</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default FeedbackPanel;
