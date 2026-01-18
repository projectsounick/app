import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import * as HealthConnectService from "@/services/healthSync/healthConnectService";

const { width } = Dimensions.get("window");

interface HealthConnectSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  type: "steps" | "sleep";
}

export default function HealthConnectSetupModal({
  visible,
  onClose,
  onContinue,
  type,
}: HealthConnectSetupModalProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [playStoreLoading, setPlayStoreLoading] = useState(false);
  const [healthConnectInstalled, setHealthConnectInstalled] = useState(true);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  useEffect(() => {
    if (visible) {
      checkHealthConnectInstallation();
    }
  }, [visible]);

  const checkHealthConnectInstallation = async () => {
    try {
      const installed = await HealthConnectService.isHealthConnectInstalled();
      setHealthConnectInstalled(installed);
    } catch (error: any) {
      setHealthConnectInstalled(false);
    }
  };

  const handleOpenPlayStore = async () => {
    try {
      setPlayStoreLoading(true);
      await HealthConnectService.openHealthConnectPlayStore();
      setTimeout(() => {
        setPlayStoreLoading(false);
      }, 500);
    } catch (error: any) {
      setPlayStoreLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setIsRequestingPermissions(true);
      
      // First check if Health Connect is installed
      const installed = await HealthConnectService.isHealthConnectInstalled();
      if (!installed) {
        setIsRequestingPermissions(false);
        // Health Connect not installed - user should install it first
        return;
      }

      // Try to initialize Health Connect (may fail if native module not properly set up)
      // Since initHealthKit method is not available, user must grant permissions manually
      // We'll still try, but it will likely fail
      try {
        await HealthConnectService.initializeHealthConnect(false);
      } catch (error) {
        // Expected to fail - native module methods not available
        // User needs to grant permissions manually in Health Connect
      }
      
      setIsRequestingPermissions(false);
      
      // Always proceed - user has been instructed to grant permissions manually
      // Sync will check permissions and show message if not granted
      onContinue();
    } catch (error: any) {
      setIsRequestingPermissions(false);
      // If initialization fails, still try to continue (sync will handle it)
      onContinue();
    }
  };

  const permissionName = type === "steps" ? "Steps" : "Sleep Analysis";
  const iconName = type === "steps" ? "walk" : "moon-waning-crescent";
  const iconColor = type === "steps" ? theme.colors.secondPrimary : theme.colors.success;

  const styles = getStyles(theme, isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
              <MaterialCommunityIcons name={iconName} size={40} color={iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Setup Health Connect</Text>

          {/* Description */}
          <Text style={styles.description}>
            Health Connect is required to sync your {type} data on Android. Follow the steps below to get started.
          </Text>

          {/* Steps */}
          <ScrollView 
            style={styles.stepsContainer}
            showsVerticalScrollIndicator={false}
          >
            {!healthConnectInstalled && (
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Download Health Connect</Text>
                  <Text style={styles.stepDescription}>
                    • Tap 'Open Play Store' button below{"\n"}
                    • Search for 'Health Connect' by Google{"\n"}
                    • Install the app{"\n"}
                    • Once installed, come back to this app
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{healthConnectInstalled ? "1" : "2"}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Open Health Connect App</Text>
                <Text style={styles.stepDescription}>
                  • Go to your app drawer (swipe up from home screen){"\n"}
                  • Look for 'Health Connect' app icon (usually has a heart or health symbol){"\n"}
                  • If you can't find it, use the search bar in your app drawer{"\n"}
                  • Type 'Health Connect' and tap on it when it appears{"\n"}
                  • The app will open showing your health data dashboard
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{healthConnectInstalled ? "2" : "3"}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enable Health Connect Permissions (REQUIRED)</Text>
                <Text style={styles.stepDescription}>
                  <Text style={styles.boldText}>⚠️ If you only see Camera/Microphone/Storage:{"\n"}</Text>
                  Health Connect permissions (Steps, Sleep) aren't requested yet.{"\n"}
                  Tap 'Continue' below FIRST to trigger the request, then follow steps below.{"\n\n"}
                  <Text style={styles.boldText}>Method 1 - Inside Health Connect App (RECOMMENDED):{"\n\n"}</Text>
                  Step A: Open Health Connect App{"\n"}
                  • Find and open the Health Connect app (not Settings){"\n"}
                  • This is the app with the heart/health icon{"\n\n"}
                  Step B: Go to Data & Access{"\n"}
                  • Tap 'Data and access' tab at the bottom{"\n"}
                  • If tab is disabled: Restart phone, then try again{"\n\n"}
                  Step C: Find iness{"\n"}
                  • Scroll to find 'iness' in the apps list{"\n"}
                  • If not visible: Tap Continue below, wait 5 seconds, check again{"\n\n"}
                  Step D: Enable Health Permissions{"\n"}
                  • Tap on 'iness'{"\n"}
                  • You should see: Steps, Sleep Analysis, Heart Rate, etc.{"\n"}
                  • Enable 'Steps' and 'Sleep Analysis' (toggle ON){"\n"}
                  • Tap 'Allow' or 'Save'{"\n"}
                  • You'll see checkmarks ✓ when granted{"\n\n"}
                  <Text style={styles.boldText}>⚠️ If you only see Camera/Microphone:{"\n"}</Text>
                  • Health Connect permissions weren't requested yet{"\n"}
                  • Tap 'Continue' button below to trigger the request{"\n"}
                  • Wait 5-10 seconds, then check Health Connect again{"\n"}
                  • If still not showing, restart phone and try again
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{healthConnectInstalled ? "3" : "4"}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Return & Sync</Text>
                <Text style={styles.stepDescription}>
                  • Come back to this iness app{"\n"}
                  • Make sure you've granted 'Steps' and 'Sleep Analysis' in Health Connect{"\n"}
                  • You should see checkmarks ✓ in Health Connect before continuing{"\n"}
                  • Tap 'Continue' button below to start syncing your {type} data{"\n"}
                  • If permissions are granted, sync will start automatically{"\n"}
                  • If sync fails, check Health Connect again - permissions may need to be re-enabled
                </Text>
              </View>
            </View>

          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {!healthConnectInstalled && (
              <TouchableOpacity
                onPress={handleOpenPlayStore}
                disabled={playStoreLoading}
                style={styles.secondaryButton}
              >
                {playStoreLoading ? (
                  <ActivityIndicator 
                    color={isDark ? theme.colors.textWhite : theme.colors.black} 
                    size="small" 
                  />
                ) : (
                  <>
                    <Ionicons 
                      name="storefront-outline" 
                      size={20} 
                      color={isDark ? theme.colors.textWhite : theme.colors.black} 
                    />
                    <Text style={styles.secondaryButtonText}>Open Play Store</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleContinue}
              disabled={playStoreLoading || isRequestingPermissions}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={[theme.colors.success, theme.colors.success]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isRequestingPermissions ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 24,
      padding: 24,
      width: width * 0.9,
      maxWidth: 400,
      maxHeight: "85%",
      ...(isDark
        ? {
            borderWidth: 1,
            borderColor: theme.colors.border,
          }
        : {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 8,
          }),
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? theme.colors.background
        : theme.colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    iconContainer: {
      alignItems: "center",
      marginTop: 8,
      marginBottom: 20,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold as "700",
      color: isDark ? theme.colors.textWhite : theme.colors.black,
      textAlign: "center",
      marginBottom: 12,
      fontFamily: theme.fonts.bold,
    },
    description: {
      fontSize: theme.fontSizes.regular,
      textAlign: "center",
      color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
      fontFamily: theme.fonts.regular,
    },
    stepsContainer: {
      maxHeight: 300,
      marginBottom: 24,
    },
    stepRow: {
      flexDirection: "row",
      marginBottom: 20,
      alignItems: "flex-start",
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.success,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      marginTop: 2,
    },
    stepNumberText: {
      color: "#fff",
      fontSize: theme.fontSizes.small,
      fontWeight: theme.fontWeights.bold as "700",
      fontFamily: theme.fonts.bold,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: theme.fontSizes.regularSmall,
      fontWeight: theme.fontWeights.semiBold as "600",
      color: isDark ? theme.colors.textWhite : theme.colors.black,
      marginBottom: 4,
      fontFamily: theme.fonts.medium,
    },
    stepDescription: {
      fontSize: theme.fontSizes.small,
      color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
      lineHeight: 20,
      fontFamily: theme.fonts.regular,
    },
    boldText: {
      fontWeight: theme.fontWeights.bold as "700",
      color: isDark ? theme.colors.textWhite : theme.colors.black,
      fontFamily: theme.fonts.bold,
    },
    buttonContainer: {
      gap: 12,
    },
    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: isDark
        ? theme.colors.background
        : theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
    },
    secondaryButtonText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: isDark ? theme.colors.textWhite : theme.colors.black,
      fontFamily: theme.fonts.medium,
    },
    primaryButton: {
      borderRadius: 12,
      overflow: "hidden",
    },
    gradientButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 8,
    },
    primaryButtonText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: "#fff",
      fontFamily: theme.fonts.bold,
    },
  });
