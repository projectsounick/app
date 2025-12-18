import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "@/app/services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/app/Theme/globalTheme";

const { height } = Dimensions.get("window");

const CURRENT_VERSION = Constants.expoConfig?.version || "1.0.0";

// Utility to compare versions (semver-safe)
const isNewerVersion = (latest: string, current: string) => {
  const latestParts = latest.split(".").map(Number);
  const currentParts = current.split(".").map(Number);

  for (let i = 0; i < latestParts.length; i++) {
    if ((latestParts[i] || 0) > (currentParts[i] || 0)) return true;
    if ((latestParts[i] || 0) < (currentParts[i] || 0)) return false;
  }

  return false;
};

const AppUpdateBottomSheet = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [releaseNote, setReleaseNote] = useState<string | null>(null);
  const [mandatoryUpdate, setMandatoryUpdate] = useState<boolean>(false);
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const baseUrlAndroid =
          "https://inessstorage.blob.core.windows.net/iness-public/androidVersion.json";
        const baseUrlIos =
          "https://inessstorage.blob.core.windows.net/iness-public/iosVersion.json";

        const baseUrl =
          Platform.OS === "ios" ? baseUrlIos : baseUrlAndroid;

        // Cache buster to avoid stale JSON from CDN/browser cache
        const cacheBuster = Date.now();
        const fullUrl = `${baseUrl}?cb=${cacheBuster}`;

        const response = await fetch(fullUrl);

        if (!response.ok) {
          return;
        }

        const raw = await response.json();

        let latest: string | null = null;
        let latestReleaseNote: string | null = null;
        let isMandatory: boolean = false;

        if (Array.isArray(raw) && raw.length > 0) {
          if (typeof raw[0] === "string") {
            // Legacy: ["1.0.0", "1.1.0"]
            latest = raw[0] as string;
            isMandatory = false; // Legacy format doesn't support mandatory
          } else if (typeof raw[0] === "object" && raw[0]?.version) {
            // New format: [{ version, releaseNote?, mandatoryUpdate? }, ...]
            latest = String(raw[0].version);
            if (raw[0].releaseNote) {
              latestReleaseNote = String(raw[0].releaseNote);
            }
            isMandatory = Boolean(raw[0].mandatoryUpdate) || false;
          }
        }

        if (!latest) {
          return;
        }

        // Fetch user from AsyncStorage to get versionModalClicked if present
        const userStr = await AsyncStorage.getItem("user");
        let versionModalClicked: string | null = null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.versionModalClicked) {
              versionModalClicked = String(user.versionModalClicked);
            }
          } catch (err) {
            versionModalClicked = null;
          }
        }

        // Show modal only if:
        // 1) latest > current app version AND
        // 2) user has not already interacted with this or a newer version
        const hasNewerThanCurrent = isNewerVersion(latest, CURRENT_VERSION);

        const hasAlreadySeenThisOrNewer =
          versionModalClicked &&
          !isNewerVersion(latest, versionModalClicked);

        const shouldShowModal = hasNewerThanCurrent && !hasAlreadySeenThisOrNewer;

        if (shouldShowModal) {
          setLatestVersion(latest);
          setReleaseNote(latestReleaseNote);
          setMandatoryUpdate(isMandatory);
          setIsVisible(true);
        }
      } catch (error) {
        // Error checking version
      }
    };

    // Add a small delay to ensure component is mounted
    const timer = setTimeout(() => {
    checkVersion();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = async () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/in/app/iness/id6749477397"
        : "https://play.google.com/store/apps/details?id=com.iness.fitness";
    Linking.openURL(url);

    // If not mandatory, track that user clicked update
    if (!mandatoryUpdate && latestVersion) {
      try {
        await userService.updateUser({
          versionModalClicked: latestVersion,
        });

        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.versionModalClicked = latestVersion;
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }

        // Close modal after opening store
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
        });
      } catch (err) {
        // Failed to update versionModalClicked
      }
    }
    // If mandatory, don't close modal - let it stay open so they see it again if they return
  };

  const handleInteraction = async () => {
    // If mandatory update, show alert and prevent closing
    if (mandatoryUpdate) {
      Alert.alert(
        "Mandatory Update Required",
        "This is a mandatory update. Please update the app to continue using all features and ensure the best experience.",
        [
          {
            text: "Update Now",
            onPress: () => {
              handleUpdate();
              // Don't close modal, let user go to store
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
      return;
    }

    if (!latestVersion) {
      setIsVisible(false);
      return;
    }

    try {
      // Update in backend user details
      await userService.updateUser({
        versionModalClicked: latestVersion,
      });

      // Also update locally cached user for future sessions
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.versionModalClicked = latestVersion;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    } catch (err) {
      console.error("Failed to update versionModalClicked", err);
    }

    // Animate slide down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={mandatoryUpdate ? undefined : handleInteraction}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropTransitionOutTiming={0}
      style={styles.modal}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Close button - hidden if mandatory */}
          {!mandatoryUpdate && (
            <TouchableOpacity
              style={styles.closeButtonTop}
              onPress={handleInteraction}
            >
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          )}

          {/* Icon container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={Platform.OS === "ios" ? "logo-apple" : "logo-android"}
                size={40}
                color={Platform.OS === "ios" ? "#000" : "#67C694"}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {Platform.OS === "ios"
              ? "New iOS Version is Live 🎉"
              : "New Android Version is Live 🎉"}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {mandatoryUpdate
              ? `A mandatory update (${latestVersion}) is required. Please update the app to continue using all features.`
              : `A new version (${latestVersion}) of the app is available. Update now to enjoy the latest improvements and fixes.`}
          </Text>

          {/* Release notes */}
          {releaseNote ? (
            <View style={styles.releaseNoteBox}>
              <Text style={styles.releaseNoteTitle}>What's new</Text>
              <Text style={styles.releaseNoteText}>{releaseNote}</Text>
            </View>
          ) : null}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.updateButton,
                mandatoryUpdate && styles.updateButtonFullWidth,
              ]}
              onPress={handleUpdate}
            >
              <Text style={styles.updateText}>
                {Platform.OS === "ios" ? "Update on App Store" : "Update on Play Store"}
              </Text>
            </TouchableOpacity>

            {!mandatoryUpdate && (
              <TouchableOpacity
                style={styles.maybeLaterButton}
                onPress={handleInteraction}
              >
                <Text style={styles.maybeLaterText}>Maybe Later</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AppUpdateBottomSheet;

// Styles
const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  closeButtonTop: {
    position: "absolute",
    top: 18,
    right: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  releaseNoteBox: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  releaseNoteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  releaseNoteText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#67C694",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonFullWidth: {
    flex: 1,
    width: "100%",
  },
  updateText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  maybeLaterButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  maybeLaterText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
});
