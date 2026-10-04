import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../Theme/globalTheme";

export default function CommonHeader() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerBackground}>
        {/* Top Row: Profile + Icons */}
        <View style={styles.headerTopRow}>
          <View style={styles.profileSection}>
            <Image
              source={require("../../assets/images/favicon.png")} // 🔁 Replace with your image
              style={styles.profileImage}
            />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.weightText}>
                <Text style={{ color: theme.colors.primary }}>↑ </Text>
                79 kgs <Text style={{ color: theme.colors.primary }}>+</Text>
              </Text>
              <Text style={styles.trainLabel}>TRAIN</Text>
            </View>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons name="cart" size={22} color={theme.colors.textWhite} style={styles.icon} />
            <Ionicons name="notifications" size={22} color={theme.colors.textWhite} />
          </View>
        </View>

        {/* Main Text */}
        <Text style={styles.title}>
          50% off on our{"\n"}Corporate Wellness Program
        </Text>
        <Text style={styles.subtitle}>
          Tailored especially for employees with hectic schedules
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerBackground: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: theme.colors.secondPrimary, // fallback if image doesn't load
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  weightText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
  },
  trainLabel: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.bold as "700",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 12,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    lineHeight: 24,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textLight,
    fontSize: theme.fontSizes.regularSmall,
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: theme.colors.secondPrimary,
    fontWeight: theme.fontWeights.bold as "700",
    fontSize: theme.fontSizes.regularSmall,
  },
});
