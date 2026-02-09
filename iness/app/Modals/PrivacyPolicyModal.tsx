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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
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
          backgroundColor: theme.colors.overlay,
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
                backgroundColor: theme.colors.divider,
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
              borderBottomColor: theme.colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: theme.fontSizes.large,
                  fontWeight: theme.fontWeights.bold as "700",
                  color: "#000",
                  fontFamily: theme.fonts.bold,
                }}
              >
                Privacy Policy
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSizes.small,
                  color: "#666",
                  marginTop: 4,
                  fontFamily: theme.fonts.regular,
                }}
              >
                Last updated: January 21, 2025
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#E5E5E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color="#000" />
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
              <PolicySection theme={theme}
                icon="account-circle"
                title="1. Information We Collect"
                content="We collect personal data including your name, email, phone number, gender, age, address, fitness goals, health-related data, and payment information. We may also collect data about your usage of the app and device-related information to improve your experience.

Health Data (Optional): If you choose to enable Health Connect (Android) or Apple Health (iOS) integration, we may collect your daily step count and sleep duration data. This data is only collected if you explicitly grant permission and enable the sync feature in the app settings. You have full control over this data and can disable the sync feature at any time."
              />

              {/* Section 2 */}
              <PolicySection theme={theme}
                icon="key-variant"
                title="2. Permissions We Request"
                content="• Camera Access: Used to upload profile pictures.
• Notifications: For workout reminders and updates.
• Health Connect (Android) / Apple Health (iOS): If you choose to enable health data sync, we request read-only access to your steps and sleep data. This feature is completely optional and only activated if you explicitly grant permission. We use this data solely to automatically sync your daily step count and sleep duration into the app, eliminating the need for manual entry. The app only reads this data and never writes to your health data. You can disable this feature at any time through the app settings or by revoking permissions in your device's Health Connect/Apple Health settings."
              />

              {/* Section 3 */}
              <PolicySection theme={theme}
                icon="cog"
                title="3. How We Use Your Information"
                content="• Provide personalized experiences
• Offer support
• Process payments
• Improve app performance"
              />

              {/* Section 4 */}
              <PolicySection theme={theme}
                icon="lock"
                title="4. Data Security"
                content="We use encryption and industry protocols to protect your data. However, no system is 100% secure."
              />

              {/* Section 5 */}
              <PolicySection theme={theme}
                icon="share-variant"
                title="5. Sharing Your Information"
                content="Only with your consent or for legal compliance. Your data is never sold."
              />

              {/* Section 6 */}
              <PolicySection theme={theme}
                icon="account-check"
                title="6. Your Rights"
                content="• Update or delete your data
• Revoke permissions anytime
• Opt-out of promotional messages"
              />

              {/* Section 7 */}
              <PolicySection theme={theme}
                icon="update"
                title="7. Changes to This Policy"
                content="Updates will be posted here and communicated via email."
              />

              {/* Contact */}
              <View
                style={{
                  marginTop: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={theme.colors.secondPrimary}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                    fontSize: theme.fontSizes.regularSmall,
                    color: "#000",
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
                  marginTop: 16,
                }}
              >
                  <Text
                    style={{
                      fontSize: theme.fontSizes.regular,
                      fontWeight: theme.fontWeights.medium as "500",
                      color: theme.colors.warning,
                      marginBottom: 8,
                      fontFamily: theme.fonts.bold,
                    }}
                  >
                    Cancellation & Refund Policy
                  </Text>
                <Text
                  style={{
                    fontSize: theme.fontSizes.regularSmall,
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
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.medium as "500",
                    color: theme.colors.secondPrimary,
                    marginBottom: 8,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  User Conduct & Content Policy
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSizes.regularSmall,
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
                  fontSize: theme.fontSizes.regularSmall,
                  color: "#666",
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
                borderTopColor: theme.colors.border,
              }}
            >
              <TouchableOpacity
                onPress={handleAccept}
                activeOpacity={0.8}
                style={{
                  backgroundColor: theme.colors.success,
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
                  color={theme.colors.textWhite}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontWeight: theme.fontWeights.bold as "700",
                    fontSize: theme.fontSizes.medium,
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
  theme: any;
}> = ({ icon, title, content, theme }) => (
  <View
    style={{
      marginTop: 16,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <View
        style={{
          backgroundColor: "#F5F5F5",
          borderRadius: 10,
          padding: 8,
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.secondPrimary} />
      </View>
              <Text
                style={{
                  fontSize: theme.fontSizes.regular,
                  fontWeight: theme.fontWeights.medium as "500",
                  color: "#000",
                  flex: 1,
                  fontFamily: theme.fonts.bold,
                }}
              >
                {title}
              </Text>
    </View>
    <Text
      style={{
        fontSize: theme.fontSizes.small,
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

