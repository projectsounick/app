import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { userService } from "@/app/services/user.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface DarkModeSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onActivate?: () => void; // Made optional since we're not using it anymore
}

export default function DarkModeSetupModal({
  visible,
  onClose,
  onActivate,
}: DarkModeSetupModalProps) {
  const theme = useGlobalTheme();
  const { isDark, setThemeMode, setShowDarkModeModal } = useTheme();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset loading state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setLoading(false);
    } else {
      // Ensure loading is reset when modal closes
      setLoading(false);
    }
  }, [visible]);

  // Cleanup: Ensure modal state is reset when component unmounts
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const handleGoToSettings = async () => {
    try {
      setLoading(true);
      // Get current user data
      const userResponse = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userResponse.exists || !userResponse.data) {
        console.error("User not found in storage");
        setLoading(false);
        return;
      }

      const userData = userResponse.data;

      // Update user with modal shown flag (user will toggle dark mode from settings)
      const updateData = {
        darkModeModalShown: true,
      };

      const response = await userService.updateUser(updateData);

      if (response.success && response.user) {
        // Update local storage with new user data
        await asyncStorageUtils.updateUserDataInAsyncStorage(response.user);
        
        // Close modal immediately
        setShowDarkModeModal(false);
        onClose();
        
        // Navigate to app settings screen
        router.push("/dashboard/appsettings");
      } else {
        console.error("Failed to update modal state");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error saving modal state:", error);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      // Get current user data
      const userResponse = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userResponse.exists || !userResponse.data) {
        console.error("User not found in storage");
        setShowDarkModeModal(false);
        onClose();
        setLoading(false);
        return;
      }

      const userData = userResponse.data;

      // Update user with modal shown flag (but keep dark mode as false)
      const updateData = {
        darkModeModalShown: true,
      };

      const response = await userService.updateUser(updateData);

      if (response.success && response.user) {
        // Update local storage with new user data
        await asyncStorageUtils.updateUserDataInAsyncStorage(response.user);
      }
      
      // Close modal immediately (don't wait for response)
      setShowDarkModeModal(false);
      onClose();
      setLoading(false);
    } catch (error) {
      console.error("Error saving modal state:", error);
      setShowDarkModeModal(false);
      onClose();
      setLoading(false);
    }
  };

  const styles = getStyles(theme, isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer} pointerEvents="auto">
          {/* Close Button */}
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.closeButton}
            disabled={loading}
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? theme.colors.textWhite : theme.colors.text}
            />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="moon"
              size={48}
              color={theme.colors.secondPrimary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enable Dark Mode?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Experience a comfortable viewing experience with our dark theme. You can enable it from App Settings.
          </Text>

          {/* Buttons */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.success} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Not Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoToSettings}
                style={styles.activateButton}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.success, "#4CAF50"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activateButtonGradient}
                >
                  <Ionicons name="settings-outline" size={20} color={theme.colors.textWhite} />
                  <Text style={styles.activateButtonText}>Go to Settings</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
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
    },
    modalContainer: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 24,
      padding: 24,
      width: width * 0.85,
      alignItems: "center",
      ...(isDark
        ? {}
        : {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 8,
          }),
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark
        ? theme.colors.background
        : theme.colors.backgroundCardLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 8,
    },
    title: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold as "700",
      color: isDark ? theme.colors.textWhite : theme.colors.black,
      marginBottom: 12,
      textAlign: "center",
      fontFamily: theme.fonts.bold,
    },
    description: {
      fontSize: theme.fontSizes.regular,
      textAlign: "center",
      color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
      marginBottom: 28,
      lineHeight: 22,
      fontFamily: theme.fonts.regular,
    },
    buttonContainer: {
      width: "100%",
      gap: 12,
    },
    cancelButton: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 30,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? theme.colors.background
        : theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButtonText: {
      color: isDark ? theme.colors.textWhite : theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      fontFamily: theme.fonts.medium,
    },
    activateButton: {
      width: "100%",
      borderRadius: 30,
      overflow: "hidden",
    },
    activateButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 32,
      gap: 8,
    },
    activateButtonText: {
      color: theme.colors.textWhite,
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      fontFamily: theme.fonts.bold,
    },
    loadingContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
    },
    loadingText: {
      marginTop: 12,
      fontSize: theme.fontSizes.regular,
      color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
      fontFamily: theme.fonts.regular,
    },
  });

