import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { router } from "expo-router";

const handleCoupons = () => router.push("/dashboard/coupon");
const handlePolicy = () => router.push("/dashboard/policy");

const handleCalculator = () => router.push("/dashboard/calculator");
const handleYourPurchases = () => router.push("/dashboard/purchases");
const handleMeasurements = () => router.push("/dashboard/measurement");
const handleWeightTrack = () => router.push("/dashboard/trackWeight");
const handleCertificates = () => router.push("/dashboard/certificates");
const handleMedicalCitations = () => router.push({ pathname: "/dashboard/medicalcitations" } as any);
const handleAppSettings = () => router.push("/dashboard/appsettings");
export default function SettingsList() {

  const settings = [
    {
      icon: "settings-outline",
      label: "App Settings",
      onPress: handleAppSettings,
    },
    {
      icon: "fitness", // progress icon
      label: "Body Weight Track",
      onPress:
        // navigate to Weight Tracker screen
        handleWeightTrack,
    },
    { icon: "pricetags-outline", label: "Coupons", onPress: handleCoupons },
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
      icon: "ribbon-outline",
      label: "Our Certificates",
      onPress: handleCertificates,
    },
    { icon: "document-text-outline", label: "Policy", onPress: handlePolicy },
    {
      icon: "medical-outline",
      label: "Medical Citations",
      onPress: handleMedicalCitations,
    },
    
  ];

  return (
    <View>
      {settings.map((item: any, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          style={{
            backgroundColor: theme.colors.cardLight,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={item.icon}
              size={20}
              color={item.color || theme.colors.dark}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: item.color || theme.colors.dark,
                fontFamily: theme.fonts.bold,
              }}
            >
              {item.label}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.dark}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
