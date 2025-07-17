import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const options = [
  { icon: "emoticon-happy-outline", label: "Good" },
  { icon: "star-circle-outline", label: "Excellent" },
  { icon: "emoticon-sad-outline", label: "Not satisfied" },
  { icon: "comment-text-outline", label: "Other" },
];

const FeedbackModal = ({
  visible,
  onClose,
  onSubmit,
  sessionId,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  sessionId: string;
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState("");

  const handleSelect = (label: string) => {
    setSelectedOption(label);
    if (label !== "Other") setCustomFeedback("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
            Give your feedback
          </Text>

          <ScrollView
            style={{ maxHeight: 250 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {options.map((opt: any) => (
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
                  name={opt.icon}
                  size={24}
                  color="#333"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 15, flex: 1 }}>{opt.label}</Text>
                <View
                  style={{
                    height: 18,
                    width: 18,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: "#333",
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
                        backgroundColor: "#333",
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
                  borderColor: "#ccc",
                  borderRadius: 6,
                  padding: 10,
                  marginTop: 12,
                  fontSize: 14,
                }}
                placeholder="Write your feedback..."
                value={customFeedback}
                onChangeText={setCustomFeedback}
              />
            )}
          </ScrollView>

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
                backgroundColor: "#f8d7da",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#721c24", fontWeight: "600" }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onSubmit(
                  selectedOption === "Other"
                    ? customFeedback
                    : selectedOption || ""
                )
              }
              style={{
                backgroundColor: "#d4edda",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#155724", fontWeight: "600" }}>
                Submit
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
