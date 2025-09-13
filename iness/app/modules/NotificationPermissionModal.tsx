import React, { useEffect, useState, useRef } from "react";
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
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import theme from "../Theme/globalTheme";

const { height, width } = Dimensions.get("window");
const MODAL_DISMISSED_FLAG_KEY = "notificationModalDismissed";

export default function NotificationPermissionBottomSheet() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    checkAndShowModal();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const checkAndShowModal = async () => {
    let tokenCheck;
    const userCheck =
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
    if (userCheck.exists)
      tokenCheck = userCheck.data.expoPushToken ? true : false;

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
      return Date.now() - timestamp < 2 * 24 * 60 * 60 * 1000;
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
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
                const subscription = AppState.addEventListener(
                  "change",
                  async (nextAppState) => {
                    if (nextAppState === "active") {
                      const permissionCheck =
                        await Notifications.getPermissionsAsync();
                      if (permissionCheck.status === "granted") {
                        subscription.remove();
                        await registerPushToken();
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
      await registerPushToken();
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setLoading(false);
    }
  };

  const registerPushToken = async () => {
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
  };

  const handleClose = async () => {
    await setModalFlag();
    setVisible(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      />
      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View
          style={{
            width: 50,
            height: 5,
            backgroundColor: "#ccc",
            borderRadius: 3,
            alignSelf: "center",
            marginTop: 2,
            marginBottom: 10,
          }}
        />

        <Text style={styles.title}>Turn On Notifications</Text>
        <Text style={styles.message}>
          Enable notifications to receive important updates and reminders.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.turnOnButton}
              onPress={handleTurnOn}
            >
              <Text style={styles.turnOnText}>Turn On</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.maybeLaterButton}
              onPress={handleClose}
            >
              <Text style={styles.maybeLaterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 24,
    backgroundColor: "#1A1A2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#ccc",
    fontFamily: theme.fonts.medium,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
  },
  turnOnButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  turnOnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  maybeLaterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  maybeLaterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
