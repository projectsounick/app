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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { height, width } = Dimensions.get("window");
const MODAL_DISMISSED_FLAG_KEY = "notificationModalDismissed";

export default function NotificationPermissionBottomSheet() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme);
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

    const response = await userService.updateUser({
      expoPushToken: token,
      appPlatform: Platform.OS === "ios" ? "ios" : "android",
    });

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
        <View style={styles.handle} />

        <View style={styles.iconContainer}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="notifications-outline" size={40} color="#67C694" />
          </View>
        </View>

        <Text style={styles.title}>Turn On Notifications</Text>
        <Text style={styles.message}>
          Enable notifications to receive important updates and reminders about
          your fitness journey.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#67C694"
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

const getStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  turnOnButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  turnOnText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
  },
  maybeLaterButton: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  maybeLaterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
  },
});
