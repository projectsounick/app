import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  ImageBackground,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { router } from "expo-router";
import HealthReportUploader from "@/app/modules/UploadReportPdf";
import theme from "@/app/Theme/globalTheme";
import { useAppleHealthSync } from "@/hooks/useAppleHealthSync";
import { HealthKit } from "@/services/healthSync";
import { trackService } from "@/app/services/track.service";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

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
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalText}>{content}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default function AppSettingsScreen() {
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
  
  // Health Sync
  const { syncStatus, isAvailable, refreshSyncStatus, syncData } = useAppleHealthSync();
  const [stepsSyncEnabled, setStepsSyncEnabled] = useState(false);
  const [sleepSyncEnabled, setSleepSyncEnabled] = useState(false);
  const [syncingSteps, setSyncingSteps] = useState(false);
  const [syncingSleep, setSyncingSleep] = useState(false);
  
  // Track pending disable operation - when user goes to settings to turn off permissions
  const [pendingDisableType, setPendingDisableType] = useState<"steps" | "sleep" | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const wentToSettingsRef = useRef(false);

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

  const healthSyncInfo = {
    title: "Health Data Sync",
    content:
      "Sync your steps and sleep data from Apple Health. When enabled, your health data will automatically sync with the app. You can turn off sync at any time. If you turn off sync, you'll need to grant permissions again when you turn it back on.",
  };

  const handleStepsSyncToggle = async (value: boolean) => {
    if (!isAvailable) {
      setSnackbarMessage("Apple Health is only available on iOS devices");
      setSnackbarOpen(true);
      return;
    }

    if (value && !stepsSyncEnabled) {
      // Turning ON - trigger sync
      console.log("[AppSettings] Turning ON steps sync");
      setSyncingSteps(true);
      try {
        const result = await syncData("steps");
        
        if (result.success) {
          setStepsSyncEnabled(true);
          await refreshSyncStatus();
          setSnackbarMessage("Steps sync enabled successfully");
          setSnackbarOpen(true);
        } else {
          // Check if it's a permission issue
          if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
            HealthKit.showPermissionDeniedAlert();
          } else {
            setSnackbarMessage(result.error || "Failed to enable steps sync");
            setSnackbarOpen(true);
          }
        }
      } catch (error: any) {
        console.error("[AppSettings] Error enabling steps sync:", error);
        setSnackbarMessage("Failed to enable steps sync");
        setSnackbarOpen(true);
      } finally {
        setSyncingSteps(false);
      }
    } else if (!value && stepsSyncEnabled) {
      // Turning OFF - show guide to go to Health settings
      console.log("[AppSettings] Turning OFF steps sync - showing guide");
      setPendingDisableType("steps");
      
      Alert.alert(
        "Turn Off Steps Sync",
        "To turn off steps sync, please disable permissions in Apple Health:\n\n1. Tap 'Open Settings' below\n2. Go to Health → Data Access & Devices\n3. Find 'iness' and turn OFF Steps\n4. Return to this app",
        [
          { 
            text: "Cancel", 
            style: "cancel", 
            onPress: () => {
              setPendingDisableType(null);
              wentToSettingsRef.current = false;
            }
          },
          {
            text: "Open Settings",
            onPress: () => {
              wentToSettingsRef.current = true;
              HealthKit.openHealthSettings();
            },
          },
        ]
      );
    }
  };

  const handleSleepSyncToggle = async (value: boolean) => {
    if (!isAvailable) {
      setSnackbarMessage("Apple Health is only available on iOS devices");
      setSnackbarOpen(true);
      return;
    }

    if (value && !sleepSyncEnabled) {
      // Turning ON - trigger sync
      console.log("[AppSettings] Turning ON sleep sync");
      setSyncingSleep(true);
      try {
        const result = await syncData("sleep");
        
        if (result.success) {
          setSleepSyncEnabled(true);
          await refreshSyncStatus();
          setSnackbarMessage("Sleep sync enabled successfully");
          setSnackbarOpen(true);
        } else {
          // Check if it's a permission issue
          if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
            HealthKit.showPermissionDeniedAlert();
          } else {
            setSnackbarMessage(result.error || "Failed to enable sleep sync");
            setSnackbarOpen(true);
          }
        }
      } catch (error: any) {
        console.error("[AppSettings] Error enabling sleep sync:", error);
        setSnackbarMessage("Failed to enable sleep sync");
        setSnackbarOpen(true);
      } finally {
        setSyncingSleep(false);
      }
    } else if (!value && sleepSyncEnabled) {
      // Turning OFF - show guide to go to Health settings
      console.log("[AppSettings] Turning OFF sleep sync - showing guide");
      setPendingDisableType("sleep");
      
      Alert.alert(
        "Turn Off Sleep Sync",
        "To turn off sleep sync, please disable permissions in Apple Health:\n\n1. Tap 'Open Settings' below\n2. Go to Health → Data Access & Devices\n3. Find 'iness' and turn OFF Sleep\n4. Return to this app",
        [
          { 
            text: "Cancel", 
            style: "cancel", 
            onPress: () => {
              setPendingDisableType(null);
              wentToSettingsRef.current = false;
            }
          },
          {
            text: "Open Settings",
            onPress: () => {
              wentToSettingsRef.current = true;
              HealthKit.openHealthSettings();
            },
          },
        ]
      );
    }
  };

  const handleInfoClick = (info: { title: string; content: string }) => {
    setCurrentInfoModal(info);
    setInfoModalVisible(true);
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
      setStepsSyncEnabled(syncStatus.stepSync);
      setSleepSyncEnabled(syncStatus.sleepSync);
    }
  }, [syncStatus]);

  // AppState listener - detect when user returns from Health settings
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      // Only check if we went to settings and are now returning
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        pendingDisableType &&
        wentToSettingsRef.current
      ) {
        console.log("[AppSettings] User returned from settings, checking permissions for:", pendingDisableType);
        
        // Reset the went to settings flag
        wentToSettingsRef.current = false;
        
        // Small delay to allow system to update permissions
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset HealthKit to get fresh permission state
        HealthKit.resetInitialization();
        
        // Check if permissions are now OFF
        console.log("[AppSettings] Calling checkPermissionsStatus for:", pendingDisableType);
        const hasPermissions = await HealthKit.checkPermissionsStatus(pendingDisableType);
        console.log("[AppSettings] Permissions check result:", hasPermissions, "(false means OFF)");
        
        if (!hasPermissions) {
          // Permissions are OFF - update backend
          console.log("[AppSettings] Permissions are OFF, updating backend");
          try {
            setLoading(true);
            const response = await trackService.disableHealthSync(pendingDisableType);
            
            if (response.success) {
              if (pendingDisableType === "steps") {
                setStepsSyncEnabled(false);
              } else {
                setSleepSyncEnabled(false);
              }
              await refreshSyncStatus();
              setSnackbarMessage(`${pendingDisableType === "steps" ? "Steps" : "Sleep"} sync turned off`);
              setSnackbarOpen(true);
            } else {
              setSnackbarMessage(response.message || "Failed to update sync status");
              setSnackbarOpen(true);
            }
          } catch (error) {
            console.error("[AppSettings] Error disabling sync:", error);
            setSnackbarMessage("Failed to turn off sync");
            setSnackbarOpen(true);
          } finally {
            setLoading(false);
          }
        } else {
          // Permissions still ON - user didn't turn them off
          console.log("[AppSettings] Permissions still ON, sync not disabled");
          setSnackbarMessage("Please turn off permissions in Health settings to disable sync");
          setSnackbarOpen(true);
        }
        
        // Clear pending state
        setPendingDisableType(null);
      }
      
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [pendingDisableType, refreshSyncStatus]);

  // Clear pending state on mount (in case of stale state)
  useEffect(() => {
    setPendingDisableType(null);
    wentToSettingsRef.current = false;
  }, []);

  const loadHealthSyncStatus = async () => {
    try {
      const response = await trackService.getHealthSyncStatus();
      if (response.success && response.data) {
        setStepsSyncEnabled(response.data.stepSync || false);
        setSleepSyncEnabled(response.data.sleepSync || false);
      }
    } catch (error) {
      console.error("Error loading health sync status:", error);
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
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f2f2f2" }}
          edges={["left", "right"]}
        >
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
              <ActivityIndicator color="#9747FF" size="large" />
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
                      color="#9747FF"
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
                      color="#9747FF"
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
                      <ActivityIndicator color="#67C694" size="small" />
                    ) : (
                      <Switch
                        value={notificationEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: "#E0E0E0", true: "#67C694" }}
                        thumbColor={notificationEnabled ? "#FFFFFF" : "#F4F3F4"}
                        ios_backgroundColor="#E0E0E0"
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Health Data Sync - iOS Only */}
              {Platform.OS === "ios" && isAvailable && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="heart-outline"
                        size={18}
                        color="#9747FF"
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
                        color="#9747FF"
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
                            ? "Your steps data is syncing from Apple Health"
                            : "Sync your daily steps from Apple Health"}
                        </Text>
                      </View>
                      {syncingSteps ? (
                        <ActivityIndicator color="#9747FF" size="small" />
                      ) : (
                        <Switch
                          value={stepsSyncEnabled}
                          onValueChange={handleStepsSyncToggle}
                          trackColor={{ false: "#E0E0E0", true: "#9747FF" }}
                          thumbColor={stepsSyncEnabled ? "#FFFFFF" : "#F4F3F4"}
                          ios_backgroundColor="#E0E0E0"
                        />
                      )}
                    </View>

                    {/* Sleep Sync Toggle */}
                    <View style={styles.settingRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.settingTitle}>Sleep Sync</Text>
                        <Text style={styles.settingSubtitle}>
                          {sleepSyncEnabled
                            ? "Your sleep data is syncing from Apple Health"
                            : "Sync your sleep duration from Apple Health"}
                        </Text>
                      </View>
                      {syncingSleep ? (
                        <ActivityIndicator color="#9747FF" size="small" />
                      ) : (
                        <Switch
                          value={sleepSyncEnabled}
                          onValueChange={handleSleepSyncToggle}
                          trackColor={{ false: "#E0E0E0", true: "#9747FF" }}
                          thumbColor={sleepSyncEnabled ? "#FFFFFF" : "#F4F3F4"}
                          ios_backgroundColor="#E0E0E0"
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
                      color="#9747FF"
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
                      color="#9747FF"
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
                      color="#1A1A1A"
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
                      color="#9747FF"
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
                      color="#9747FF"
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
                      color="#1A1A1A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="log-out-outline" size={18} color="#9747FF" />
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
                      color="#1A1A1A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delete Account */}
              <View style={[styles.card, styles.dangerCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.dangerIconContainer}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </View>
                  <Text style={styles.dangerTitle}>Delete Account</Text>
                </View>

                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={() => setDeleteAccountModalVisible(true)}
                    style={styles.settingRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.settingTitle, { color: "#FF6B6B" }]}>
                        Permanently Delete Account
                      </Text>
                      <Text style={styles.settingSubtitle}>
                        Your account will be permanently deleted
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#FF6B6B"
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
                    <Ionicons name="warning" size={30} color="#FF6B6B" />
                  </View>
                  <Text style={styles.deleteModalTitle}>Are you sure?</Text>
                  <Text style={styles.deleteModalText}>
                    Your account will be permanently deleted. This action cannot
                    be undone.
                  </Text>
                </View>

                {isDeleting ? (
                  <View style={styles.deletingContainer}>
                    <ActivityIndicator color="#FF6B6B" size="large" />
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
            bgColor="#67C694"
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  dangerCard: {
    borderColor: "#FFEBEE",
  },
  cardHeader: {
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
    marginRight: 12,
  },
  dangerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B6B",
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 2,
    fontFamily: theme.fonts.medium,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#888",
    lineHeight: 16,
    fontFamily: theme.fonts.regular,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  // Delete modal styles
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  deleteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  deleteModalText: {
    fontSize: 14,
    color: "#666",
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
    fontSize: 14,
    color: "#666",
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    fontFamily: theme.fonts.medium,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: theme.fonts.medium,
  },
});
