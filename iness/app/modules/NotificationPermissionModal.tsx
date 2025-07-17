import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AppState,
  Linking,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { userService } from "../services/user.service";

const MODAL_DISMISSED_FLAG_KEY = "notificationModalDismissed";

export default function NotificationPermissionModal() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    checkAndShowModal();
  }, []);

  const checkAndShowModal = async () => {
    let tokenCheck;
    const userCheck =
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
    if (userCheck.exists) {
      tokenCheck = userCheck.data.expoPushToken ? true : false;
    }

    const permission = await Notifications.getPermissionsAsync();

    const modalFlag = await checkIfModalFlagActive();

    if ((!tokenCheck || permission.status !== "granted") && !modalFlag) {
      setVisible(true);
    }
  };

  const checkIfModalFlagActive = async (): Promise<boolean> => {
    const json = await AsyncStorage.getItem(MODAL_DISMISSED_FLAG_KEY);
    if (!json) return false;

    try {
      const { timestamp } = JSON.parse(json);
      const now = Date.now();
      return now - timestamp < 2 * 24 * 60 * 60 * 1000; // 2 days
    } catch {
      return false;
    }
  };

  const setModalFlag = () => {
    AsyncStorage.setItem(
      MODAL_DISMISSED_FLAG_KEY,
      JSON.stringify({ timestamp: Date.now() })
    );
  };

  const handleTurnOn = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Enable Notifications",
          "Please enable notifications from settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();

                // Add AppState listener
                const subscription = AppState.addEventListener(
                  "change",
                  async (nextAppState) => {
                    if (nextAppState === "active") {
                      const permissionCheck =
                        await Notifications.getPermissionsAsync();
                      if (permissionCheck.status === "granted") {
                        subscription.remove(); // Remove the listener

                        setLoading(true);

                        const projectId =
                          Constants?.expoConfig?.extra?.eas?.projectId ??
                          Constants?.easConfig?.projectId;

                        const pushTokenResponse = projectId
                          ? await Notifications.getExpoPushTokenAsync({
                              projectId,
                            })
                          : await Notifications.getExpoPushTokenAsync();

                        const token = pushTokenResponse.data;

                        let responsenew =
                          await asyncStorageUtils.updateUserDataInAsyncStorage({
                            expoPushToken: token,
                          });

                        if (Platform.OS === "android") {
                          await Notifications.setNotificationChannelAsync(
                            "default",
                            {
                              name: "default",
                              importance: Notifications.AndroidImportance.MAX,
                              vibrationPattern: [0, 250, 250, 250],
                              lightColor: "#FF231F7C",
                            }
                          );
                        }
                        console.log("went till here");

                        const response = await userService.updateUser({
                          expoPushToken: token,
                        });

                        if (response.success) {
                          setModalFlag();
                          setVisible(false);
                        } else {
                          alert("Try again");
                        }

                        setLoading(false);
                      }
                    }
                  }
                );
              },
            },
          ]
        );

        return;
      }

      // Already granted, continue as usual
      setLoading(true);
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const pushTokenResponse = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();

      const token = pushTokenResponse.data;

      await asyncStorageUtils.updateUserDataInAsyncStorage({
        expoPushToken: token,
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const response = await userService.updateUser({ expoPushToken: token });

      if (response.success) {
        setModalFlag();
        setVisible(false);
      } else {
        alert("Try again");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await setModalFlag();
    setVisible(false);
  };

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Turn On Notifications</Text>
          <Text style={styles.message}>
            Enable notifications to receive important updates.
          </Text>
          {loading ? (
            <View>
              <ActivityIndicator />
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={styles.turnOnButton}
                onPress={handleTurnOn}
              >
                <Text style={styles.turnOnText}>Turn On</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#19002E",
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
  },
  turnOnButton: {
    backgroundColor: "rgba(189, 255, 132, 1)",
    width: 114,
    height: 28,
    borderRadius: 16,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  turnOnText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 12,
  },
  closeText: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
});
