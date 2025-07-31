import React from "react";
import { View, Text, ScrollView, ImageBackground } from "react-native";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        resizeMode="cover"
        style={{
          flex: 1,
          justifyContent: "flex-start",
          backgroundColor: "#000",
        }}
      >
        <View style={{ paddingTop: 30, paddingLeft: 20 }}>
          <NormalHeader screenName="Policies" />
        </View>

        <ScrollView
          style={{ flex: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }} // 👈 Add this
        >
          {policies.map((policy, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.cardLight,
                padding: 15,
                borderRadius: 12,
                marginBottom: index === policies.length ? 25 : 15,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}
              >
                {policy.title}
              </Text>
              <Text style={{ fontSize: 14, color: "#444", lineHeight: 20 }}>
                {policy.content}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
