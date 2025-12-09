import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height
////// Main functional component for the policy screen ---------------------------------/
export default function PolicyScreen() {
  const policies = [
    {
      title: "Privacy Policy",
      content:
        "We respect your privacy. All your data including name, email, and health/activity details are stored securely and never shared with third parties without consent. We comply with Indian data protection laws including the Information Technology Act, 2000.",
    },
    {
      title: "Data Usage",
      content:
        "Your data is used to improve your experience and provide personalized health insights. We may analyze usage patterns anonymously to improve our services.",
    },
    {
      title: "Security",
      content:
        "We implement industry-standard security protocols to protect your data from unauthorized access or breaches. This includes encrypted data transmission and secure cloud storage.",
    },
    {
      title: "User Responsibilities",
      content:
        "Users are responsible for maintaining the confidentiality of their login credentials and providing accurate personal information. Misuse of the platform may lead to termination of access.",
    },
    {
      title: "Contact & Grievances",
      content:
        "If you have any concerns or grievances, you can reach out to our Grievance Officer at support@yourapp.in. We aim to resolve all complaints in accordance with Indian IT laws.",
    },
    {
      title: "Changes to Policy",
      content:
        "This policy may be updated from time to time. Users will be notified via in-app alerts. Continued use of the app constitutes acceptance of the updated policy.",
    },
  ];

  const getIconForPolicy = (title: string) => {
    switch (title) {
      case "Privacy Policy":
        return "lock-closed-outline";
      case "Data Usage":
        return "analytics-outline";
      case "Security":
        return "shield-checkmark-outline";
      case "User Responsibilities":
        return "person-outline";
      case "Contact & Grievances":
        return "mail-outline";
      case "Changes to Policy":
        return "document-text-outline";
      default:
        return "information-circle-outline";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Policies" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 40,
            }}
          >
            {policies.map((policy, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 20,
                  borderRadius: 20,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={getIconForPolicy(policy.title) as any}
                      size={22}
                      color="#9747FF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    {policy.title}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 22,
                  }}
                >
                  {policy.content}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
