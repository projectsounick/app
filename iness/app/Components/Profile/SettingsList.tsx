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

  const dashboardCard =
    userRole === "trainer" || userRole === "admin"
      ? {
          icon: userRole === "admin" ? "shield-checkmark-outline" : "barbell-outline",
          label: userRole === "admin" ? "Admin Dashboard" : "Trainer Dashboard",
          helper:
            userRole === "admin"
              ? "Review operations, track activity, and move into your management workspace quickly."
              : "Open your workspace to manage members, sessions, and follow-ups without digging through tabs.",
          badge: userRole === "admin" ? "Admin Access" : "Trainer Access",
          onPress: handleDashboard,
        }
      : null;

  const settings = [
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
      {dashboardCard ? (
        <View style={styles.dashboardSection}>
          <View style={styles.dashboardSectionHeader}>
            <Text style={styles.dashboardSectionTitle}>Workspace</Text>
            <View style={styles.dashboardBadge}>
              <Text style={styles.dashboardBadgeText}>{dashboardCard.badge}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={dashboardCard.onPress}
            style={styles.dashboardCard}
            activeOpacity={0.85}
          >
            <View style={styles.dashboardCardTopRow}>
              <View style={styles.dashboardIconShell}>
                <Ionicons
                  name={dashboardCard.icon as any}
                  size={20}
                  color={theme.colors.secondPrimary}
                />
              </View>

              <View style={styles.dashboardTextBlock}>
                <Text style={styles.dashboardTitle}>{dashboardCard.label}</Text>
                <Text style={styles.dashboardHelper}>{dashboardCard.helper}</Text>
              </View>

              <View style={styles.dashboardArrowShell}>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={theme.colors.secondPrimary}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {settings.map((item: any) => (
        <TouchableOpacity
          key={item.label}
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
  dashboardSection: {
    marginBottom: 14,
  },
  dashboardSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  dashboardSectionTitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
    fontWeight: theme.fontWeights.medium as "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dashboardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.backgroundCardLight,
    borderWidth: 1,
    borderColor: isDark ? theme.colors.border : "rgba(151, 71, 255, 0.12)",
  },
  dashboardBadgeText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
    fontWeight: theme.fontWeights.medium as "500",
  },
  dashboardCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 2,
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
    borderWidth: 1,
    borderColor: isDark ? theme.colors.border : "rgba(151, 71, 255, 0.12)",
    ...(isDark
      ? {}
      : {
          shadowColor: theme.colors.secondPrimary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 2,
        }),
  },
  dashboardCardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dashboardIconShell: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  dashboardTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  dashboardTitle: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontWeight: theme.fontWeights.bold as "700",
    marginBottom: 4,
  },
  dashboardHelper: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  dashboardArrowShell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
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
