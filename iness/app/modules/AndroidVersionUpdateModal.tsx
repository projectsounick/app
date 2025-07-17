import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import Constants from "expo-constants";

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
  const [latestVersion, setLatestVersion] = useState("1.1.0"); // You can comment this for now

  useEffect(() => {
    const checkVersion = async () => {
      try {
        console.log("this is current version");
        console.log(CURRENT_VERSION);

        const response = await fetch(
          "https://inessstorage.blob.core.windows.net/iness-public/androidVersion.json"
        );
        const versions: string[] = await response.json();
        console.log("this are versions");
        console.log(versions);

        if (!versions.length) return;

        const latest = versions[0]; // 🔥 First is latest
        console.log("this is latest version");
        console.log(latest);

        if (isNewerVersion(latest, CURRENT_VERSION)) {
          console.log("went here");

          const dismissed = await getDismissedVersion();
          if (dismissed !== latest) {
            setLatestVersion(latest); // Update state
            setIsVisible(true); // Show bottom sheet
          }
        }
      } catch (error) {
        console.error("Failed to check version", error);
      }
    };

    checkVersion();
  }, []);

  const handleUpdate = () => {
    Linking.openURL(
      "https://play.google.com/store/apps/details?id=com.iness.fitness"
    );
  };
  const handleClose = async () => {
    await storeDismissedVersion(latestVersion);
    setIsVisible(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>New Version Available 🎉</Text>
        <Text style={styles.description}>
          A new version ({latestVersion}) of the app is available. Update now
          for the latest features and improvements!
        </Text>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateText}>Update Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default AppUpdateBottomSheet;

// LocalStorage Helpers
import AsyncStorage from "@react-native-async-storage/async-storage";

const getDismissedVersion = async () => {
  try {
    return await AsyncStorage.getItem("dismissedVersion");
  } catch (err) {
    return null;
  }
};

const storeDismissedVersion = async (version: string) => {
  try {
    await AsyncStorage.setItem("dismissedVersion", version);
  } catch (err) {
    console.error("Failed to store dismissed version", err);
  }
};

// Styles
const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  updateButton: {
    backgroundColor: "#6200EE",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  updateText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  closeText: {
    fontSize: 14,
    color: "#888",
  },
});
