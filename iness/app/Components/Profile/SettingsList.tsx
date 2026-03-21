import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { router } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

const handleCoupons = () => router.push("/dashboard/coupon");
const handleCalculator = () => router.push("/dashboard/calculator");
const handleYourPurchases = () => router.push("/dashboard/purchases");
const handleMeasurements = () => router.push("/dashboard/measurement");
const handleWeightTrack = () => router.push("/dashboard/trackWeight");
const handleAppSettings = () => router.push("/dashboard/appsettings");
const handleAdditionalInfo = () => router.push("/dashboard/additionalinfo");
const handleMeditation = () => router.push("/dashboard/meditation");
const handleTrainers = () => router.push("/dashboard/trainers");
const handleDashboard = () => router.push("/dashboard/trainerDashboard" as any);

export default function SettingsList() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userData.exists && userData.data?.role) {
        setUserRole(userData.data.role);
      }
    };
    getUserRole();
  }, []);

  const settings = [
    // Dashboard option for trainers and admins
    ...(userRole === "trainer" || userRole === "admin"
      ? [
          {
            icon: "grid-outline",
            label: "Dashboard",
            onPress: handleDashboard,
          },
        ]
      : []),
    {
      icon: "people-outline",
      label: "Trainers",
      onPress: handleTrainers,
    },
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
      icon: "leaf-outline",
      label: "Meditation",
      onPress: handleMeditation,
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
              <Ionicons name={item.icon} size={18} color={theme.colors.secondPrimary} />
            </View>
            <Text style={styles.labelText}>{item.label}</Text>
          </View>

          {/* Right arrow */}
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  settingItem: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  labelText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontWeight: theme.fontWeights.medium as "500",
  },
});
