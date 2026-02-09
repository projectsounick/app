import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { router } from "expo-router";
import HealthReportUploader from "@/app/modules/UploadReportPdf";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { useAppleHealthSync } from "@/hooks/useAppleHealthSync";
import { useAndroidHealthSync } from "@/hooks/useAndroidHealthSync";
import { HealthKit, HealthConnect } from "@/services/healthSync";
import { trackService } from "@/app/services/track.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

// Style functions - defined early so they can be used in components
const getHealthSyncModalStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: theme.colors.divider,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: theme.fonts.bold,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
  },
  settingsButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  settingsButtonText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.medium,
  },
});

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  dangerCard: {
    borderColor: theme.colors.errorLight,
  },
  cardHeader: {
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
    marginRight: 12,
  },
  dangerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.errorLight || theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  dangerTitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.error,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fonts.medium,
  },
  settingSubtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    lineHeight: 16,
    fontFamily: theme.fonts.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  deleteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.errorLight || theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  deleteModalText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  deletingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  deletingText: {
    marginTop: 12,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.errorRed,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.medium,
  },
});

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  title,
  content,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalText}>{content}</Text>
        </View>
      </View>
    </Modal>
  );
};

// Health Sync Guide Modal - Bottom Sheet Style
interface HealthSyncGuideModalProps {
  visible: boolean;
  onClose: () => void;
  type: "steps" | "sleep";
  action: "enable" | "disable";
  onContinue: () => void;
  loading?: boolean;
}

const HealthSyncGuideModal: React.FC<HealthSyncGuideModalProps> = ({
  visible,
  onClose,
  type,
  action,
  onContinue,
  loading = false,
}) => {
  const theme = useGlobalTheme();
  const healthSyncModalStyles = getHealthSyncModalStyles(theme);
  const isSteps = type === "steps";
  const isEnable = action === "enable";
  const permissionName = isSteps ? "Steps" : "Sleep Analysis";
  
  const healthAppName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";
  const steps = isEnable
    ? [
        `Tap 'Open Settings' below to go to ${healthAppName}`,
        Platform.OS === "ios" 
          ? `Find 'iness' under Data Access & Devices`
          : `Find 'iness' in the list of apps`,
        `Turn ON the "${permissionName}" toggle`,
        "Return here and tap 'Continue'",
      ]
    : [
        `Tap 'Open Settings' below to go to ${healthAppName}`,
        Platform.OS === "ios" 
          ? `Find 'iness' under Data Access & Devices`
          : `Find 'iness' in the list of apps`,
        `Turn OFF the "${permissionName}" toggle`,
        "Return here and tap 'Continue'",
      ];

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={healthSyncModalStyles.overlay}>
        <TouchableOpacity 
          style={healthSyncModalStyles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={healthSyncModalStyles.sheet}>
          {/* Handle Bar */}
          <View style={healthSyncModalStyles.handleBar} />
          
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={healthSyncModalStyles.closeBtn}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          {/* Icon */}
          <View style={healthSyncModalStyles.iconContainer}>
            <View style={[
              healthSyncModalStyles.iconCircle,
              { backgroundColor: isSteps ? theme.colors.backgroundCardLight : theme.colors.greenLight }
            ]}>
              <Ionicons 
                name={isSteps ? "walk-outline" : "moon-outline"} 
                size={32} 
                color={isSteps ? theme.colors.secondPrimary : theme.colors.success} 
              />
            </View>
          </View>
          
          {/* Title */}
          <Text style={healthSyncModalStyles.title}>
            {isEnable ? `Enable ${isSteps ? "Steps" : "Sleep"} Sync` : `Turn Off ${isSteps ? "Steps" : "Sleep"} Sync`}
          </Text>
          
          {/* Steps List */}
          <View style={healthSyncModalStyles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={healthSyncModalStyles.stepRow}>
                <View style={healthSyncModalStyles.stepNumber}>
                  <Text style={healthSyncModalStyles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={healthSyncModalStyles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
          
          {/* Note */}
          <View style={healthSyncModalStyles.noteContainer}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
            <Text style={healthSyncModalStyles.noteText}>
              {isEnable 
                ? "If you don't enable the permission in Health, tapping Continue won't change anything."
                : "If you don't disable the permission in Health, tapping Continue won't change anything."
              }
            </Text>
          </View>
          
          {/* Buttons */}
          <View style={healthSyncModalStyles.buttonsContainer}>
            <TouchableOpacity 
              style={healthSyncModalStyles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={healthSyncModalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={healthSyncModalStyles.settingsButton}
              onPress={() => HealthKit.openHealthSettings()}
              disabled={loading}
            >
              <Ionicons name="settings-outline" size={18} color={theme.colors.secondPrimary} />
              <Text style={healthSyncModalStyles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              healthSyncModalStyles.continueButton,
              loading && { opacity: 0.7 }
            ]}
            onPress={onContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.textWhite} />
            ) : (
              <Text style={healthSyncModalStyles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function AppSettingsScreen() {
  const theme = useGlobalTheme();
  const { setThemeMode, isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [healthReportModalVisible, setHealthReportModalVisible] =
    useState(false);
  const [currentInfoModal, setCurrentInfoModal] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Health Sync - Platform-aware hook selection
  const iosHealthSync = useAppleHealthSync();
  const androidHealthSync = useAndroidHealthSync();
  const { syncStatus, isAvailable, refreshSyncStatus, syncData } = Platform.OS === "ios" 
    ? iosHealthSync 
    : androidHealthSync;
  const [stepsSyncEnabled, setStepsSyncEnabled] = useState(false);
  const [sleepSyncEnabled, setSleepSyncEnabled] = useState(false);
  const [syncingSteps, setSyncingSteps] = useState(false);
  const [syncingSleep, setSyncingSleep] = useState(false);
  
  // Health Sync Guide Modal state
  const [syncGuideModalVisible, setSyncGuideModalVisible] = useState(false);
  const [syncGuideModalType, setSyncGuideModalType] = useState<"steps" | "sleep">("steps");
  const [syncGuideModalAction, setSyncGuideModalAction] = useState<"enable" | "disable">("enable");
  const [syncGuideLoading, setSyncGuideLoading] = useState(false);

  const notificationInfo = {
    title: "Notification Settings",
    content:
      "You can control whether you receive push notifications from the app. If notifications are turned off, you won't receive any updates, reminders, or important messages.",
  };

  const healthReportInfo = {
    title: "Health Report Upload",
    content:
      "Upload your health reports in PDF format. Our team will review your reports and provide personalized recommendations. Please note that any recommendations are for informational purposes only and are not a substitute for professional medical advice.",
  };

  const preferencesInfo = {
    title: "Preferences",
    content:
      "Set your session preferences including date, time slot, and location. You can update your preferences or request changes to your existing preferences. Preferences help us schedule your sessions according to your convenience.",
  };

  const healthAppName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";
  const healthSyncInfo = {
    title: "Health Data Sync",
    content:
      `Sync your steps and sleep data from ${healthAppName}. When enabled, your health data will automatically sync with the app. You can turn off sync at any time. If you turn off sync, you'll need to grant permissions again when you turn it back on.`,
  };

  const darkModeInfo = {
    title: "Dark Mode",
    content:
      "Enable dark mode to use a darker color scheme throughout the app. This can help reduce eye strain in low-light conditions and may help conserve battery on devices with OLED displays.",
  };

  const handleDarkModeToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const handleStepsSyncToggle = async (value: boolean) => {
    if (!isAvailable) {
      const platformName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";
      setSnackbarMessage(`${platformName} is not available on this device`);
      setSnackbarOpen(true);
      return;
    }

    if (Platform.OS === "android") {
      // Android: Open Health Connect and trigger sync
      if (value && !stepsSyncEnabled) {
        // Turning ON - open Health Connect settings, then trigger sync
        await HealthConnect.openHealthConnectSettings();
        // Trigger sync (will request permissions if not granted)
        setSyncingSteps(true);
        setTimeout(async () => {
          const result = await syncData("steps");
          setSyncingSteps(false);
          if (result.success) {
            await refreshSyncStatus();
            setSnackbarMessage("Steps sync enabled successfully");
            setSnackbarOpen(true);
          } else {
            setSnackbarMessage(result.error || "Please grant Steps permission in Health Connect and try again");
            setSnackbarOpen(true);
          }
        }, 500); // Small delay to let Health Connect open
      } else if (!value && stepsSyncEnabled) {
        // Turning OFF - disable sync
        const response = await trackService.disableHealthSync("steps", "android");
        if (response.success) {
          try {
            const userDataStr = await AsyncStorage.getItem("user");
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              if (!userData.androidHealth) userData.androidHealth = {};
              userData.androidHealth.stepSync = false;
              userData.androidHealth.lastSyncedStepsDate = null;
              userData.androidHealth.lastSyncedStepsValue = null;
              await AsyncStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (e) {
            console.error("[AppSettings] AsyncStorage error:", e);
          }
          setStepsSyncEnabled(false);
          await refreshSyncStatus();
          setSnackbarMessage("Steps sync turned off");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage(response.message || "Failed to turn off sync");
          setSnackbarOpen(true);
        }
      }
    } else {
      // iOS: Show guidance modal
      if (value && !stepsSyncEnabled) {
        // Turning ON - show guidance modal
        setSyncGuideModalType("steps");
        setSyncGuideModalAction("enable");
        setSyncGuideModalVisible(true);
      } else if (!value && stepsSyncEnabled) {
        // Turning OFF - show guidance modal
        setSyncGuideModalType("steps");
        setSyncGuideModalAction("disable");
        setSyncGuideModalVisible(true);
      }
    }
  };

  const handleSleepSyncToggle = async (value: boolean) => {
    if (!isAvailable) {
      const platformName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";
      setSnackbarMessage(`${platformName} is not available on this device`);
      setSnackbarOpen(true);
      return;
    }

    if (Platform.OS === "android") {
      // Android: Open Health Connect and trigger sync
      if (value && !sleepSyncEnabled) {
        // Turning ON - open Health Connect settings, then trigger sync
        await HealthConnect.openHealthConnectSettings();
        // Trigger sync (will request permissions if not granted)
        setSyncingSleep(true);
        setTimeout(async () => {
          const result = await syncData("sleep");
          setSyncingSleep(false);
          if (result.success) {
            await refreshSyncStatus();
            setSnackbarMessage("Sleep sync enabled successfully");
            setSnackbarOpen(true);
          } else {
            setSnackbarMessage(result.error || "Please grant Sleep permission in Health Connect and try again");
            setSnackbarOpen(true);
          }
        }, 500); // Small delay to let Health Connect open
      } else if (!value && sleepSyncEnabled) {
        // Turning OFF - disable sync
        const response = await trackService.disableHealthSync("sleep", "android");
        if (response.success) {
          try {
            const userDataStr = await AsyncStorage.getItem("user");
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              if (!userData.androidHealth) userData.androidHealth = {};
              userData.androidHealth.sleepSync = false;
              userData.androidHealth.lastSyncedSleepDate = null;
              userData.androidHealth.lastSyncedSleepValue = null;
              await AsyncStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (e) {
            console.error("[AppSettings] AsyncStorage error:", e);
          }
          setSleepSyncEnabled(false);
          await refreshSyncStatus();
          setSnackbarMessage("Sleep sync turned off");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage(response.message || "Failed to turn off sync");
          setSnackbarOpen(true);
        }
      }
    } else {
      // iOS: Show guidance modal
      if (value && !sleepSyncEnabled) {
        // Turning ON - show guidance modal
        setSyncGuideModalType("sleep");
        setSyncGuideModalAction("enable");
        setSyncGuideModalVisible(true);
      } else if (!value && sleepSyncEnabled) {
        // Turning OFF - show guidance modal
        setSyncGuideModalType("sleep");
        setSyncGuideModalAction("disable");
        setSyncGuideModalVisible(true);
      }
    }
  };

  const handleInfoClick = (info: { title: string; content: string }) => {
    setCurrentInfoModal(info);
    setInfoModalVisible(true);
  };

  // Handle Continue button in Health Sync Guide Modal
  const handleSyncGuideContinue = async () => {
    const type = syncGuideModalType;
    const action = syncGuideModalAction;
    
    setSyncGuideLoading(true);
    
    try {
      if (action === "enable") {
        // Enabling sync
        if (type === "steps") {
          setSyncingSteps(true);
        } else {
          setSyncingSleep(true);
        }
        
        const result = await syncData(type);
        
        if (result.success) {
          if (type === "steps") {
            setStepsSyncEnabled(true);
          } else {
            setSleepSyncEnabled(true);
          }
          await refreshSyncStatus();
          setSnackbarMessage(`${type === "steps" ? "Steps" : "Sleep"} sync enabled successfully`);
          setSnackbarOpen(true);
          setSyncGuideModalVisible(false);
        } else {
          setSnackbarMessage(result.error || `Could not enable ${type} sync. Please ensure permission is granted in Health settings.`);
          setSnackbarOpen(true);
        }
        
        if (type === "steps") {
          setSyncingSteps(false);
        } else {
          setSyncingSleep(false);
        }
      } else {
        // Disabling sync
        if (Platform.OS === "android") {
          // Android: Disable Health Connect sync
          // For Android, we can disable sync even if permissions are still granted
          // (user can revoke permissions in Health Connect separately)
          const response = await trackService.disableHealthSync(type, "android");
          
          if (response.success) {
            // Update AsyncStorage - androidHealth field
            try {
              const userDataStr = await AsyncStorage.getItem("user");
              if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (!userData.androidHealth) userData.androidHealth = {};
                if (type === "steps") {
                  userData.androidHealth.stepSync = false;
                  // Clear last sync date
                  userData.androidHealth.lastSyncedStepsDate = null;
                  userData.androidHealth.lastSyncedStepsValue = null;
                } else {
                  userData.androidHealth.sleepSync = false;
                  // Clear last sync date
                  userData.androidHealth.lastSyncedSleepDate = null;
                  userData.androidHealth.lastSyncedSleepValue = null;
                }
                await AsyncStorage.setItem("user", JSON.stringify(userData));
              }
            } catch (e) {
              console.error("[AppSettings] AsyncStorage error:", e);
            }
            
            if (type === "steps") {
              setStepsSyncEnabled(false);
            } else {
              setSleepSyncEnabled(false);
            }
            await refreshSyncStatus();
            setSnackbarMessage(`${type === "steps" ? "Steps" : "Sleep"} sync turned off`);
            setSnackbarOpen(true);
            setSyncGuideModalVisible(false);
          } else {
            setSnackbarMessage(response.message || "Failed to turn off sync");
            setSnackbarOpen(true);
          }
        } else {
          // iOS: Disable Apple Health sync
          HealthKit.resetInitialization();
          const hasPermissions = await HealthKit.checkPermissionsStatus(type);
          
          if (!hasPermissions) {
            // Permissions are OFF - update backend (iOS platform)
            const response = await trackService.disableHealthSync(type, "ios");
            
            if (response.success) {
              // Update AsyncStorage
              try {
                const userDataStr = await AsyncStorage.getItem("user");
                if (userDataStr) {
                  const userData = JSON.parse(userDataStr);
                  if (!userData.healthSync) userData.healthSync = {};
                  if (type === "steps") {
                    userData.healthSync.stepSync = false;
                  } else {
                    userData.healthSync.sleepSync = false;
                  }
                  await AsyncStorage.setItem("user", JSON.stringify(userData));
                }
              } catch (e) {
                console.error("[AppSettings] AsyncStorage error:", e);
              }
              
              if (type === "steps") {
                setStepsSyncEnabled(false);
              } else {
                setSleepSyncEnabled(false);
              }
              await refreshSyncStatus();
              setSnackbarMessage(`${type === "steps" ? "Steps" : "Sleep"} sync turned off`);
              setSnackbarOpen(true);
              setSyncGuideModalVisible(false);
            } else {
              setSnackbarMessage(response.message || "Failed to turn off sync");
              setSnackbarOpen(true);
            }
          } else {
            // Permissions still ON
            setSnackbarMessage(`${type === "steps" ? "Steps" : "Sleep"} permission is still enabled in Health. Please disable it first.`);
            setSnackbarOpen(true);
          }
        }
      }
    } catch (error: any) {
      console.error(`[AppSettings] Error in sync guide continue:`, error);
      setSnackbarMessage(`Failed to ${action} ${type} sync`);
      setSnackbarOpen(true);
    } finally {
      setSyncGuideLoading(false);
    }
  };

  const handlePreferences = () => {
    router.push("/dashboard/preferences");
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await userService.logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.deleteaccount();
      await userService.logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      setSnackbarMessage("Failed to delete account. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
      setDeleteAccountModalVisible(false);
    }
  };

  useEffect(() => {
    loadNotificationStatus();
    loadHealthSyncStatus();
  }, []);

  // Update local state when syncStatus changes
  useEffect(() => {
    if (syncStatus) {
      const stepsEnabled = syncStatus.stepSync || false;
      const sleepEnabled = syncStatus.sleepSync || false;
      setStepsSyncEnabled(stepsEnabled);
      setSleepSyncEnabled(sleepEnabled);
      console.log(`[AppSettings] Sync status updated - Steps: ${stepsEnabled}, Sleep: ${sleepEnabled}`);
    }
  }, [syncStatus]);

  // No AppState listener needed - we handle everything with Continue button

  const loadHealthSyncStatus = async () => {
    try {
      // Load platform-specific health sync status
      const platform = Platform.OS === "ios" ? "ios" : "android";
      const response = await trackService.getHealthSyncStatus(platform);
      if (response.success && response.data) {
        setStepsSyncEnabled(response.data.stepSync || false);
        setSleepSyncEnabled(response.data.sleepSync || false);
      } else {
        // Fallback: use syncStatus from hook
        if (syncStatus) {
          setStepsSyncEnabled(syncStatus.stepSync || false);
          setSleepSyncEnabled(syncStatus.sleepSync || false);
        }
      }
    } catch (error) {
      console.error("Error loading health sync status:", error);
      // Fallback: use syncStatus from hook
      if (syncStatus) {
        setStepsSyncEnabled(syncStatus.stepSync || false);
        setSleepSyncEnabled(syncStatus.sleepSync || false);
      }
    }
  };

  const loadNotificationStatus = async () => {
    try {
      setInitialLoading(true);
      const userCheck =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userCheck.exists && userCheck.data) {
        const hasToken = !!userCheck.data.expoPushToken;
        setNotificationEnabled(hasToken);
      }
    } catch (error) {
      console.error("Error loading notification status:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (!value && notificationEnabled) {
      Alert.alert(
        "Turn Off Notifications?",
        "If you turn it off then you won't be getting any notification from us.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Turn Off",
            style: "destructive",
            onPress: async () => {
              await updateNotificationStatus(false);
            },
          },
        ]
      );
    } else if (value && !notificationEnabled) {
      Alert.alert(
        "Turn On Notifications?",
        "You will receive notifications from us. Please make sure notifications are enabled in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Turn On",
            onPress: async () => {
              setSnackbarMessage(
                "Please enable notifications in your device settings to receive push notifications."
              );
              setSnackbarOpen(true);
            },
          },
        ]
      );
    }
  };

  const updateNotificationStatus = async (enabled: boolean) => {
    try {
      setLoading(true);
      if (!enabled) {
        const response = await userService.updateUser({
          expoPushToken: null,
        });
        if (response.success) {
          await asyncStorageUtils.updateUserDataInAsyncStorage({
            expoPushToken: null,
          });
          setNotificationEnabled(false);
          setSnackbarMessage("Notifications turned off successfully");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("Failed to update notification settings");
          setSnackbarOpen(true);
        }
      }
    } catch (error: any) {
      console.error("Error updating notification status:", error);
      setSnackbarMessage(
        "Failed to update notification settings. Please try again."
      );
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="App Settings" />
          </View>

          {initialLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={theme.colors.secondPrimary} size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Notification Settings */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="notifications-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>Notifications</Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(notificationInfo)}
                    style={styles.infoBtn}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.settingRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.settingTitle}>Push Notifications</Text>
                      <Text style={styles.settingSubtitle}>
                        {notificationEnabled
                          ? "You will receive notifications from us"
                          : "You won't receive any notifications from us"}
                      </Text>
                    </View>
                    {loading ? (
                      <ActivityIndicator color={theme.colors.success} size="small" />
                    ) : (
                      <Switch
                        value={notificationEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                        thumbColor={notificationEnabled ? theme.colors.textWhite : "#F4F3F4"}
                        ios_backgroundColor={theme.colors.border}
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Dark Mode Settings */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="moon-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>Appearance</Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(darkModeInfo)}
                    style={styles.infoBtn}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.settingRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.settingTitle}>Dark Mode</Text>
                      <Text style={styles.settingSubtitle}>
                        {isDark
                          ? "Dark mode is enabled"
                          : "Light mode is enabled"}
                      </Text>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={handleDarkModeToggle}
                      trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                      thumbColor={isDark ? theme.colors.textWhite : "#F4F3F4"}
                      ios_backgroundColor={theme.colors.border}
                    />
                  </View>
                </View>
              </View>

              {/* Health Data Sync - iOS Only (with guide modal) */}
              {Platform.OS === "ios" && isAvailable && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="heart-outline"
                        size={18}
                        color={theme.colors.secondPrimary}
                      />
                    </View>
                    <Text style={styles.cardTitle}>Health Data Sync</Text>
                    <TouchableOpacity
                      onPress={() => handleInfoClick(healthSyncInfo)}
                      style={styles.infoBtn}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={theme.colors.secondPrimary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardContent}>
                    {/* Steps Sync Toggle */}
                    <View style={[styles.settingRow, { marginBottom: 16 }]}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.settingTitle}>Steps Sync</Text>
                        <Text style={styles.settingSubtitle}>
                          {stepsSyncEnabled
                            ? `Your steps data is syncing from Apple Health`
                            : `Sync your daily steps from Apple Health`}
                        </Text>
                      </View>
                      {syncingSteps ? (
                        <ActivityIndicator color={theme.colors.success} size="small" />
                      ) : (
                        <Switch
                          value={stepsSyncEnabled}
                          onValueChange={handleStepsSyncToggle}
                          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                          thumbColor={stepsSyncEnabled ? theme.colors.textWhite : "#F4F3F4"}
                          ios_backgroundColor={theme.colors.border}
                        />
                      )}
                    </View>

                    {/* Sleep Sync Toggle */}
                    <View style={styles.settingRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.settingTitle}>Sleep Sync</Text>
                        <Text style={styles.settingSubtitle}>
                          {sleepSyncEnabled
                            ? `Your sleep data is syncing from Apple Health`
                            : `Sync your sleep duration from Apple Health`}
                        </Text>
                      </View>
                      {syncingSleep ? (
                        <ActivityIndicator color={theme.colors.success} size="small" />
                      ) : (
                        <Switch
                          value={sleepSyncEnabled}
                          onValueChange={handleSleepSyncToggle}
                          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                          thumbColor={sleepSyncEnabled ? theme.colors.textWhite : "#F4F3F4"}
                          ios_backgroundColor={theme.colors.border}
                        />
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Health Connect Sync - Android Only (opens Health Connect directly) */}
              {Platform.OS === "android" && isAvailable && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="fitness-outline"
                        size={18}
                        color={theme.colors.secondPrimary}
                      />
                    </View>
                    <Text style={styles.cardTitle}>Health Connect Sync</Text>
                    <TouchableOpacity
                      onPress={() => handleInfoClick(healthSyncInfo)}
                      style={styles.infoBtn}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={theme.colors.secondPrimary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardContent}>
                    {/* Steps Sync Toggle */}
                    <View style={[styles.settingRow, { marginBottom: 16 }]}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.settingTitle}>Steps Sync</Text>
                        <Text style={styles.settingSubtitle}>
                          {stepsSyncEnabled
                            ? `Your steps data is automatically syncing from Health Connect. This allows the app to display your daily step count without manual entry.`
                            : `Enable automatic syncing of your daily steps from Health Connect. The app will read your step count to display it in your fitness dashboard.`}
                        </Text>
                      </View>
                      {syncingSteps ? (
                        <ActivityIndicator color={theme.colors.success} size="small" />
                      ) : (
                        <Switch
                          value={stepsSyncEnabled}
                          onValueChange={handleStepsSyncToggle}
                          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                          thumbColor={stepsSyncEnabled ? theme.colors.textWhite : "#F4F3F4"}
                          ios_backgroundColor={theme.colors.border}
                        />
                      )}
                    </View>

                    {/* Sleep Sync Toggle */}
                    <View style={styles.settingRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.settingTitle}>Sleep Sync</Text>
                        <Text style={styles.settingSubtitle}>
                          {sleepSyncEnabled
                            ? `Your sleep data is automatically syncing from Health Connect. This allows the app to display your sleep duration without manual entry.`
                            : `Enable automatic syncing of your sleep duration from Health Connect. The app will read your sleep data to display it in your fitness tracking.`}
                        </Text>
                      </View>
                      {syncingSleep ? (
                        <ActivityIndicator color={theme.colors.success} size="small" />
                      ) : (
                        <Switch
                          value={sleepSyncEnabled}
                          onValueChange={handleSleepSyncToggle}
                          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                          thumbColor={sleepSyncEnabled ? theme.colors.textWhite : "#F4F3F4"}
                          ios_backgroundColor={theme.colors.border}
                        />
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Health Report Upload */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>Health Report Upload</Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(healthReportInfo)}
                    style={styles.infoBtn}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={() => setHealthReportModalVisible(true)}
                    style={styles.settingRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingTitle}>
                        Upload Health Report
                      </Text>
                      <Text style={styles.settingSubtitle}>
                        Upload your health reports in PDF format
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Preferences */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>Preferences</Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(preferencesInfo)}
                    style={styles.infoBtn}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={handlePreferences}
                    style={styles.settingRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingTitle}>Session Preferences</Text>
                      <Text style={styles.settingSubtitle}>
                        Set your date, time slot, and location preferences
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="log-out-outline" size={18} color={theme.colors.secondPrimary} />
                  </View>
                  <Text style={styles.cardTitle}>Logout</Text>
                </View>

                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.settingRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingTitle}>Sign Out</Text>
                      <Text style={styles.settingSubtitle}>
                        Logout from your account
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delete Account */}
              <View style={[styles.card, styles.dangerCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.dangerIconContainer}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.errorRed} />
                  </View>
                  <Text style={styles.dangerTitle}>Delete Account</Text>
                </View>

                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={() => setDeleteAccountModalVisible(true)}
                    style={styles.settingRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.settingTitle, { color: theme.colors.error }]}>
                        Permanently Delete Account
                      </Text>
                      <Text style={styles.settingSubtitle}>
                        Your account will be permanently deleted
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.errorRed}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Info Modal */}
          {currentInfoModal && (
            <InfoModal
              visible={infoModalVisible}
              onClose={() => {
                setInfoModalVisible(false);
                setCurrentInfoModal(null);
              }}
              title={currentInfoModal.title}
              content={currentInfoModal.content}
            />
          )}

          {/* Health Sync Guide Modal */}
          <HealthSyncGuideModal
            visible={syncGuideModalVisible}
            onClose={() => {
              setSyncGuideModalVisible(false);
              setSyncGuideLoading(false);
            }}
            type={syncGuideModalType}
            action={syncGuideModalAction}
            onContinue={handleSyncGuideContinue}
            loading={syncGuideLoading}
          />

          {/* Health Report Uploader Modal */}
          <HealthReportUploader
            modalVisible={healthReportModalVisible}
            setModalVisible={setHealthReportModalVisible}
          />

          {/* Delete Account Confirmation Modal */}
          <Modal
            transparent
            animationType="fade"
            visible={deleteAccountModalVisible}
            onRequestClose={() => setDeleteAccountModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.deleteModalHeader}>
                  <View style={styles.deleteIconContainer}>
                    <Ionicons name="warning" size={30} color={theme.colors.errorRed} />
                  </View>
                  <Text style={styles.deleteModalTitle}>Are you sure?</Text>
                  <Text style={styles.deleteModalText}>
                    Your account will be permanently deleted. This action cannot
                    be undone.
                  </Text>
                </View>

                {isDeleting ? (
                  <View style={styles.deletingContainer}>
                    <ActivityIndicator color={theme.colors.errorRed} size="large" />
                    <Text style={styles.deletingText}>Deleting account...</Text>
                  </View>
                ) : (
                  <View style={styles.deleteModalButtons}>
                    <TouchableOpacity
                      onPress={() => setDeleteAccountModalVisible(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteAccount}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>

          <CustomSnackbar
            visible={snackbarOpen}
            message={snackbarMessage}
            onDismiss={() => setSnackbarOpen(false)}
            bgColor={theme.colors.background}
          />
      </View>
    </SafeAreaView>
  );
}
