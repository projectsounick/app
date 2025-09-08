import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Linking,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
} from "react-native-health-connect";

const HealthConnectSync = () => {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [stepsPermission, setStepsPermission] = useState(false);
  const [sleepPermission, setSleepPermission] = useState(false);

  // ---- Init ----
  useEffect(() => {
    const init = async () => {
      try {
        const hcAvailable = await initialize(); // boolean
        setAvailable(hcAvailable);

        if (hcAvailable) {
          await checkPermissions();
        }
      } catch (err) {
        console.log("[init] Error:", err);
        setAvailable(false);
      }
    };

    init();
  }, []);

  // ---- Check permissions ----
  const checkPermissions = async () => {
    try {
      const granted = await getGrantedPermissions();
      const hasSteps = granted.some(
        (p) => p.recordType === "Steps" && p.accessType === "read"
      );
      const hasSleep = granted.some(
        (p) => p.recordType === "SleepSession" && p.accessType === "read"
      );
      setStepsPermission(hasSteps);
      setSleepPermission(hasSleep);
    } catch (err) {
      console.log("[checkPermissions] Error:", err);
    }
  };

  // ---- Request permission ----
  const requestPermissionFor = async (type: "steps" | "sleep") => {
    const perms: any =
      type === "steps"
        ? [{ accessType: "read", recordType: "Steps" }]
        : [{ accessType: "read", recordType: "SleepSession" }];

    try {
      await requestPermission(perms);
      await checkPermissions();
    } catch (err) {
      console.log(`[requestPermission] Error for ${type}:`, err);
    }
  };

  if (available === false) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Health Connect Not Installed</Text>
          <Text style={styles.cardSubtitle}>
            Install Health Connect from Google Play Store to sync your health
            data.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
            )
          }
          style={styles.installButton}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Install</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 20 }}>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Sync Steps</Text>
          <Text style={styles.cardSubtitle}>
            {stepsPermission ? "Granted" : "Not granted"}
          </Text>
        </View>
        <Icon name="walk-outline" size={30} color="#2196F3" />
        <Switch
          value={stepsPermission}
          onValueChange={() => requestPermissionFor("steps")}
          style={{ marginLeft: 10 }}
        />
      </View>

      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Sync Sleep</Text>
          <Text style={styles.cardSubtitle}>
            {sleepPermission ? "Granted" : "Not granted"}
          </Text>
        </View>
        <Icon name="bed-outline" size={30} color="#4CAF50" />
        <Switch
          value={sleepPermission}
          onValueChange={() => requestPermissionFor("sleep")}
          style={{ marginLeft: 10 }}
        />
      </View>
    </View>
  );
};

export default HealthConnectSync;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardSubtitle: { fontSize: 14, color: "#777", marginTop: 5 },
  installButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
});
