import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { router } from "expo-router";
import HealthReportUploader from "@/app/modules/UploadReportPdf";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose, title, content }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
                flex: 1,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F0F0F0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 22,
            }}
          >
            {content}
          </Text>
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
  const [healthReportModalVisible, setHealthReportModalVisible] = useState(false);
  const [currentInfoModal, setCurrentInfoModal] = useState<{ title: string; content: string } | null>(null);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Info content - can be passed as props or modified as needed
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

  const handleInfoClick = (info: { title: string; content: string }) => {
    setCurrentInfoModal(info);
    setInfoModalVisible(true);
  };

  const handlePreferences = () => {
    router.push("/dashboard/preferences");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await userService.logout();
          },
        },
      ]
    );
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
  }, []);

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
    // If user is trying to turn OFF notifications
    if (!value && notificationEnabled) {
      Alert.alert(
        "Turn Off Notifications?",
        "If you turn it off then you won't be getting any notification from us.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              // Keep toggle in current state (ON)
            },
          },
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
      // If user is trying to turn ON notifications
      Alert.alert(
        "Turn On Notifications?",
        "You will receive notifications from us. Please make sure notifications are enabled in your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Turn On",
            onPress: async () => {
              // Note: To turn ON, user needs to register for push token
              // This would typically require requesting notification permissions
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
        // Turn OFF: Set expoPushToken to null
        const response = await userService.updateUser({
          expoPushToken: null,
        });

        if (response.success) {
          // Update local storage
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
      setSnackbarMessage("Failed to update notification settings. Please try again.");
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
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color="#9747FF" size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Notification Settings Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="notifications" size={18} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    Notifications
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(notificationInfo)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#000",
                          marginBottom: 4,
                        }}
                      >
                        Push Notifications
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          lineHeight: 18,
                        }}
                      >
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
                        trackColor={{
                          false: "#E0E0E0",
                          true: "#67C694",
                        }}
                        thumbColor={
                          notificationEnabled ? "#FFFFFF" : "#F4F3F4"
                        }
                        ios_backgroundColor="#E0E0E0"
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Health Report Upload Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    Health Report Upload
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(healthReportInfo)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setHealthReportModalVisible(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#000",
                          marginBottom: 4,
                        }}
                      >
                        Upload Health Report
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          lineHeight: 18,
                        }}
                      >
                        Upload your health reports in PDF format
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Preferences Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="settings" size={18} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    Preferences
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleInfoClick(preferencesInfo)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <TouchableOpacity
                    onPress={handlePreferences}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#000",
                          marginBottom: 4,
                        }}
                      >
                        Session Preferences
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          lineHeight: 18,
                        }}
                      >
                        Set your date, time slot, and location preferences
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="log-out" size={18} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    Logout
                  </Text>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#000",
                          marginBottom: 4,
                        }}
                      >
                        Sign Out
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          lineHeight: 18,
                        }}
                      >
                        Logout from your account
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delete Account Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#FF6B6B",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#FF6B6B",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#FF6B6B",
                      flex: 1,
                    }}
                  >
                    Delete Account
                  </Text>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setDeleteAccountModalVisible(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#FF6B6B",
                          marginBottom: 4,
                        }}
                      >
                        Permanently Delete Account
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          lineHeight: 18,
                        }}
                      >
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
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 24,
                  width: "100%",
                  maxWidth: 400,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#FFEBEE",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons name="warning" size={30} color="#FF6B6B" />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#000",
                      marginBottom: 8,
                    }}
                  >
                    Are you sure?
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      textAlign: "center",
                      lineHeight: 20,
                    }}
                  >
                    Your account will be permanently deleted. This action cannot
                    be undone.
                  </Text>
                </View>

                {isDeleting ? (
                  <View
                    style={{
                      alignItems: "center",
                      paddingVertical: 20,
                    }}
                  >
                    <ActivityIndicator color="#FF6B6B" size="large" />
                    <Text
                      style={{
                        marginTop: 12,
                        fontSize: 14,
                        color: "#666",
                      }}
                    >
                      Deleting account...
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setDeleteAccountModalVisible(false)}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        backgroundColor: "#F0F0F0",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#666",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleDeleteAccount}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        backgroundColor: "#FF6B6B",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#FFFFFF",
                        }}
                      >
                        Delete
                      </Text>
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

