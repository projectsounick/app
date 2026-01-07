import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { Session } from "@/app/interfaces/sessionInterface";
import { sessionService } from "@/app/services/sessionService";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
const options = [
  { icon: "emoticon-happy-outline", label: "Good" },
  { icon: "star-circle-outline", label: "Excellent" },
  { icon: "emoticon-sad-outline", label: "Not satisfied" },
  { icon: "comment-text-outline", label: "Other" },
];

const FeedbackModal = ({
  visible,
  onClose,

  currentSession,
  setCurrentSession,
}: {
  visible: boolean;
  onClose: () => void;

  setCurrentSession: (session: Session | null) => void;
  currentSession: Session | null;
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const handleSelect = (label: string) => {
    setSelectedOption(label);
    if (label !== "Other") setCustomFeedback("");
  };
  const submitFeedback = async (feedback: string) => {
    if (!currentSession) return;
    if (!feedback || feedback.trim() === "") {
      Alert.alert("Error", "Please provide your feedback before submitting.");
      return;
    }
    try {
      setFeedbackLoading(true);
      const params = {
        sessionId: currentSession._id,
        data: { sessionFeedback: feedback },
      };
      const response = await sessionService.updateSession(params);
      if (response.success) {
        setCurrentSession({ ...currentSession, sessionFeedback: feedback });
        onClose(); // Close the modal
        Alert.alert("Success", "Thank you for your feedback! Your response has been submitted successfully.");
      } else {
        Alert.alert("Error", "Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setFeedbackLoading(false);
    }
  };
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ margin: 0, justifyContent: "center" }}
      useNativeDriver={true}
      propagateSwipe={true}
      backdropOpacity={0.7}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text style={{ 
            fontSize: theme.fontSizes.medium, 
            fontWeight: theme.fontWeights.bold as "700", 
            marginBottom: 16,
            color: theme.colors.text,
          }}>
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
                  color={theme.colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ 
                  fontSize: theme.fontSizes.regular, 
                  flex: 1,
                  color: theme.colors.text,
                }}>{opt.label}</Text>
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
                  backgroundColor: isDark ? theme.colors.backgroundCard : "#FFFFFF",
                  color: theme.colors.text,
                }}
                placeholder="Write your feedback..."
                placeholderTextColor={theme.colors.textMuted}
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
                backgroundColor: theme.colors.errorLight,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: theme.colors.error, fontWeight: theme.fontWeights.medium as "500" }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                submitFeedback(
                  selectedOption === "Other"
                    ? customFeedback
                    : selectedOption || ""
                )
              }
              disabled={feedbackLoading}
              style={{
                backgroundColor: theme.colors.greenLight,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                opacity: feedbackLoading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: theme.colors.success, fontWeight: theme.fontWeights.medium as "500" }}>
                {feedbackLoading ? "Submitting..." : "Submit"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
