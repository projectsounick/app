import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import theme from "../Theme/globalTheme";

const { height } = Dimensions.get("window");

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            height: height * 0.85,
            backgroundColor: "#fff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            overflow: "hidden",
          }}
        >
          {/* Drag indicator */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#E0E0E0",
                borderRadius: 2,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F0F0F0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#222",
                  fontFamily: theme.fonts.bold,
                }}
              >
                Privacy Policy
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#999",
                  marginTop: 4,
                  fontFamily: theme.fonts.regular,
                }}
              >
                Last updated: 11-06-2025
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F5F5F5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
            {/* Content */}
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 24 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Section 1 */}
              <PolicySection
                icon="account-circle"
                title="1. Information We Collect"
                content="We collect personal data including your name, email, phone number, gender, age, address, fitness goals, health-related data, and payment information. We may also collect data about your usage of the app and device-related information to improve your experience."
              />

              {/* Section 2 */}
              <PolicySection
                icon="key-variant"
                title="2. Permissions We Request"
                content="• Camera Access: Used to upload profile pictures.
• Notifications: For workout reminders and updates."
              />

              {/* Section 3 */}
              <PolicySection
                icon="cog"
                title="3. How We Use Your Information"
                content="• Provide personalized experiences
• Offer support
• Process payments
• Improve app performance"
              />

              {/* Section 4 */}
              <PolicySection
                icon="lock"
                title="4. Data Security"
                content="We use encryption and industry protocols to protect your data. However, no system is 100% secure."
              />

              {/* Section 5 */}
              <PolicySection
                icon="share-variant"
                title="5. Sharing Your Information"
                content="Only with your consent or for legal compliance. Your data is never sold."
              />

              {/* Section 6 */}
              <PolicySection
                icon="account-check"
                title="6. Your Rights"
                content="• Update or delete your data
• Revoke permissions anytime
• Opt-out of promotional messages"
              />

              {/* Section 7 */}
              <PolicySection
                icon="update"
                title="7. Changes to This Policy"
                content="Updates will be posted here and communicated via email."
              />

              {/* Contact */}
              <View
                style={{
                  backgroundColor: "#F3EDFF",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: "#E8E0F5",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color="#9747FF"
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 14,
                      color: "#333",
                      fontFamily: theme.fonts.medium,
                    }}
                  >
                    Contact: founder@iness.fitness
                  </Text>
                </View>
              </View>

              {/* Cancellation Policy */}
              <View
                style={{
                  backgroundColor: "#FFF9E6",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: "#F0E6CC",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#B8860B",
                    marginBottom: 8,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Cancellation & Refund Policy
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 20,
                    fontFamily: theme.fonts.regular,
                  }}
                >
                  • Must be requested within 24 hours of purchase{"\n"}
                  • No refund once a plan has started or content accessed{"\n"}
                  • Refunds only for eligible cases with proof
                </Text>
              </View>

              {/* User Conduct */}
              <View
                style={{
                  backgroundColor: "#F3EDFF",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: "#E8E0F5",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#7B2FD6",
                    marginBottom: 8,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  User Conduct & Content Policy
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 20,
                    fontFamily: theme.fonts.regular,
                  }}
                >
                  By using this app, you agree to our Terms of Service (EULA).
                  Zero tolerance for objectionable content or abusive users.
                  Violations may result in account suspension.
                </Text>
              </View>

              {/* Thank you */}
              <Text
                style={{
                  fontSize: 14,
                  color: "#999",
                  textAlign: "center",
                  marginTop: 24,
                  fontStyle: "italic",
                  fontFamily: theme.fonts.regular,
                }}
              >
                Thank you for trusting Iness Fitness 💜
              </Text>
            </ScrollView>

            {/* Accept Button */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 20,
                paddingTop: 12,
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#F0F0F0",
              }}
            >
              <TouchableOpacity
                onPress={handleAccept}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#67C694",
                  borderRadius: 30,
                  paddingVertical: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={22}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 17,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  I Accept
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

// Policy Section Component
const PolicySection: React.FC<{
  icon: string;
  title: string;
  content: string;
}> = ({ icon, title, content }) => (
  <View
    style={{
      marginTop: 16,
      backgroundColor: "#FAFAFA",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "#F0F0F0",
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <View
        style={{
          backgroundColor: "#F3EDFF",
          borderRadius: 10,
          padding: 8,
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons name={icon} size={20} color="#9747FF" />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: "#222",
          flex: 1,
          fontFamily: theme.fonts.bold,
        }}
      >
        {title}
      </Text>
    </View>
    <Text
      style={{
        fontSize: 13,
        color: "#666",
        lineHeight: 20,
        fontFamily: theme.fonts.regular,
      }}
    >
      {content}
    </Text>
  </View>
);

export default PrivacyPolicyModal;

