import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from "react-native";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "@/app/Theme/globalTheme";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { width } = Dimensions.get("window");

export default function AboutInessScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={backgroundImg}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <NormalHeader screenName="About Iness" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentCard}>
              <Text style={styles.title}>Welcome to Iness</Text>
              <Text style={styles.paragraph}>
                Iness is a comprehensive wellness platform dedicated to helping you
                achieve your health and fitness goals. We provide personalized workout
                plans, diet guidance, expert trainer support, and a community of
                like-minded individuals on their wellness journey.
              </Text>

              <Text style={styles.sectionTitle}>Our Mission</Text>
              <Text style={styles.paragraph}>
                To empower individuals to lead healthier, happier lives through
                accessible, personalized, and science-backed wellness solutions.
              </Text>

              <Text style={styles.sectionTitle}>What We Offer</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.featureText}>
                    Customized workout plans tailored to your fitness level and goals
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.featureText}>
                    Expert nutrition guidance and meal planning
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.featureText}>
                    One-on-one sessions with certified trainers
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.featureText}>
                    Progress tracking and analytics
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.featureText}>
                    Community support and motivation
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Our Commitment</Text>
              <Text style={styles.paragraph}>
                We are committed to providing you with the highest quality wellness
                services, backed by scientific research and delivered by experienced
                professionals. Your health and well-being are our top priorities.
              </Text>

              <Text style={styles.sectionTitle}>Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions, feedback, or need support, please don't
                hesitate to reach out to us. We're here to help you on your wellness
                journey.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: "#666",
    fontFamily: theme.fonts.regular,
    lineHeight: 24,
    marginBottom: 8,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9747FF",
    marginTop: 8,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#666",
    fontFamily: theme.fonts.regular,
    lineHeight: 24,
  },
});

