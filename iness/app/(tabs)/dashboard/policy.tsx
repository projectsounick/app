import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "@/app/Theme/globalTheme";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");

const policies = [
  {
    title: "Privacy Policy",
    icon: "shield-lock-outline",
    content:
      "We respect your privacy. All your data including name, email, and health/activity details are stored securely and never shared with third parties without consent. We comply with Indian data protection laws including the Information Technology Act, 2000.",
  },
  {
    title: "Data Usage",
    icon: "chart-line",
    content:
      "Your data is used to improve your experience and provide personalized health insights. We may analyze usage patterns anonymously to improve our services.",
  },
  {
    title: "Security",
    icon: "shield-check-outline",
    content:
      "We implement industry-standard security protocols to protect your data from unauthorized access or breaches. This includes encrypted data transmission and secure cloud storage.",
  },
  {
    title: "User Responsibilities",
    icon: "account-check-outline",
    content:
      "Users are responsible for maintaining the confidentiality of their login credentials and providing accurate personal information. Misuse of the platform may lead to termination of access.",
  },
  {
    title: "Contact & Grievances",
    icon: "email-outline",
    content:
      "If you have any concerns or grievances, you can reach out to our Grievance Officer at support@yourapp.in. We aim to resolve all complaints in accordance with Indian IT laws.",
  },
  {
    title: "Changes to Policy",
    icon: "file-document-edit-outline",
    content:
      "This policy may be updated from time to time. Users will be notified via in-app alerts. Continued use of the app constitutes acceptance of the updated policy.",
  },
];

export default function PolicyScreen() {
  return (
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["left", "right"]}
      >
        <View style={styles.headerContainer}>
          <NormalHeader screenName="Policies" />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons
                name="scale-balance"
                size={20}
                color="#9747FF"
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Terms & Policies</Text>
              <Text style={styles.infoSubtitle}>
                Please review our policies carefully
              </Text>
            </View>
          </View>

          {/* Policy Cards */}
          {policies.map((policy, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={policy.icon as any}
                    size={20}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.cardTitle}>{policy.title}</Text>
              </View>
              <Text style={styles.cardContent}>{policy.content}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? height * 0.05 : "4%",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
    fontFamily: theme.fonts.bold,
  },
  infoSubtitle: {
    fontSize: 12,
    color: "#888",
    fontFamily: theme.fonts.regular,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  cardContent: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
});
