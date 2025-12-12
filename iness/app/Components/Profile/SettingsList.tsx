import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { router } from "expo-router";

const handleCoupons = () => router.push("/dashboard/coupon");
const handleCalculator = () => router.push("/dashboard/calculator");
const handleYourPurchases = () => router.push("/dashboard/purchases");
const handleMeasurements = () => router.push("/dashboard/measurement");
const handleWeightTrack = () => router.push("/dashboard/trackWeight");
const handleAppSettings = () => router.push("/dashboard/appsettings");
const handleAdditionalInfo = () => router.push("/dashboard/additionalinfo");

export default function SettingsList() {
  const settings = [
    {
      icon: "settings-outline",
      label: "App Settings",
      onPress: handleAppSettings,
    },
    {
      icon: "fitness",
      label: "Body Weight Track",
      onPress: handleWeightTrack,
    },
    {
      icon: "pricetags-outline",
      label: "Coupons",
      onPress: handleCoupons,
    },
    {
      icon: "cart-outline",
      label: "Your Purchases",
      onPress: handleYourPurchases,
    },
    {
      icon: "calculator-outline",
      label: "Fitness Tools",
      onPress: handleCalculator,
    },
    {
      icon: "scale-outline",
      label: "Measurements",
      onPress: handleMeasurements,
    },
    {
      icon: "information-circle-outline",
      label: "Additional Information",
      onPress: handleAdditionalInfo,
    },
  ];

  return (
    <View>
      {settings.map((item: any, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          style={styles.settingItem}
          activeOpacity={0.7}
        >
          <View style={styles.leftContent}>
            {/* Icon with purple background */}
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={18} color="#9747FF" />
            </View>
            <Text style={styles.labelText}>{item.label}</Text>
          </View>

          {/* Right arrow */}
          <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  labelText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontFamily: theme.fonts.medium,
    fontWeight: "500",
  },
});
