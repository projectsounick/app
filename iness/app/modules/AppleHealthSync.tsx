// AppleHealthSync.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import BrokenHealthKit, { HealthKitPermissions } from "react-native-health";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";

const { NativeModules } = require("react-native");
const AppleHealthKit: any =
  NativeModules.AppleHealthKit as typeof BrokenHealthKit;
AppleHealthKit.Constants = BrokenHealthKit.Constants;

const AppleHealthSync = () => {
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [stepsData, setStepsData] = useState<any[]>([]);
  const [healthLastSync, setHealthLastSync] = useState<Date | null>(null);

  // permissions
  const [sleepPermission, setSleepPermission] = useState(false);
  const [stepsPermission, setStepsPermission] = useState(false);

  // user properties
  const [userStepSync, setUserStepSync] = useState<boolean>(false);
  const [userSleepSync, setUserSleepSync] = useState<boolean>(false);

  // ---- Load user object on mount ----
  useEffect(() => {
    const loadUser = async () => {
      const result =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      console.log("this is result");

      console.log(result.data?.appleHealth?.stepSync);

      if (result.exists) {
        setUserStepSync(result.data?.appleHealth?.stepSync ?? false);
        setUserSleepSync(result.data?.appleHealth?.sleepSync ?? false);
        if (result.data?.appleHealth?.lastSync) {
          setHealthLastSync(new Date(result.data.appleHealth.lastSync));
        }
      }
    };
    loadUser();
    checkPermissions();
  }, []);

  // ---- Check permissions ----
  const checkPermissions = () => {
    AppleHealthKit.getAuthStatus(
      {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
            AppleHealthKit.Constants.Permissions.StepCount,
          ],
          write: [],
        },
      },
      (error: string, results: any) => {
        if (error) {
          console.log("[checkPermissions] Error:", error);
          return;
        }
        const readStatuses = results?.permissions?.read || [];
        const [sleepStatus, stepsStatus] = readStatuses;

        const sleepAllowed = sleepStatus === 2; // 2 = authorized
        const stepsAllowed = stepsStatus === 2;

        setSleepPermission(sleepAllowed);
        setStepsPermission(stepsAllowed);
      }
    );
  };

  // ---- Request specific permission ----
  const requestPermission = (type: "steps" | "sleep") => {
    return new Promise<void>((resolve) => {
      const permissions: HealthKitPermissions = {
        permissions: {
          read: [
            type === "steps"
              ? AppleHealthKit.Constants.Permissions.StepCount
              : AppleHealthKit.Constants.Permissions.SleepAnalysis,
          ],
          write: [],
        },
      };

      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.log(`[requestPermission] Error for ${type}:`, error);
          resolve();
          return;
        }
        console.log(`[requestPermission] ${type} permission granted.`);
        checkPermissions();
        resolve();
      });
    });
  };

  // ---- Fetch Health Data ----
  const fetchHealthData = (stepsPermission: any, sleepPermission: any) => {
    const endDate = new Date();
    const startDate = healthLastSync ? healthLastSync : new Date(0);

    if (sleepPermission && userSleepSync) {
      AppleHealthKit.getSleepSamples(
        { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
        (err: string, results: any[]) => {
          if (err) {
            console.log("[fetchHealthData] getSleepSamples error:", err);
            return;
          }
          setSleepData(results || []);
        }
      );
    }
    console.log("values");

    console.log(stepsPermission);
    console.log(userStepSync);

    if (stepsPermission && userStepSync) {
      console.log("should go for step");

      AppleHealthKit.getDailyStepCountSamples(
        { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
        (err: string, results: any[]) => {
          if (err) {
            console.log(
              "[fetchHealthData] getDailyStepCountSamples error:",
              err
            );
            return;
          }
          console.log(results);

          setStepsData(results || []);
        }
      );
    }

    // update last sync after fetching
    setHealthLastSync(endDate);

    userService.updateUser({
      appleHealth: {
        stepSync: userStepSync,
        sleepSync: userSleepSync,
        lastSync: endDate,
      },
    });
  };

  // ---- Handle Step Toggle ----
  const handleStepToggle = async (val: boolean) => {
    if (val && !stepsPermission) {
      await requestPermission("steps");
    }
    setUserStepSync(val);

    userService.updateUser({
      appleHealth: {
        stepSync: val,
        sleepSync: userSleepSync,
        lastSync: new Date(),
      },
    });
    await asyncStorageUtils.updateUserDataInAsyncStorage({
      appleHealth: {
        stepSync: val,
        sleepSync: userSleepSync,
        lastSync: new Date(),
      },
    });

    // 🔹 fetch immediately if enabled
    if (val) {
      console.log("went for fetch");
      console.log(val);
      fetchHealthData(val, sleepPermission);
    }
  };

  // ---- Handle Sleep Toggle ----
  const handleSleepToggle = async (val: boolean) => {
    if (val && !sleepPermission) {
      await requestPermission("sleep");
    }
    setUserSleepSync(val);

    userService.updateUser({
      appleHealth: {
        stepSync: userStepSync,
        sleepSync: val,
        lastSync: new Date(),
      },
    });
    await asyncStorageUtils.updateUserDataInAsyncStorage({
      appleHealth: {
        stepSync: userStepSync,
        sleepSync: val,
        lastSync: new Date(),
      },
    });

    // 🔹 fetch immediately if enabled
    if (val) {
      console.log("went for fetch");
      console.log(val);

      fetchHealthData(stepsPermission, val);
    }
  };

  // ---- Fetch when toggles & permissions allow ----
  useEffect(() => {
    if (
      (userStepSync && stepsPermission) ||
      (userSleepSync && sleepPermission)
    ) {
      fetchHealthData(stepsPermission, sleepPermission);
    }
  }, [userStepSync, userSleepSync, stepsPermission, sleepPermission]);

  return (
    <View style={{ marginTop: 20 }}>
      {/* Steps Card */}
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Sync Steps</Text>
          <Text style={styles.cardSubtitle}>
            {stepsData.length > 0
              ? `Last sync: ${stepsData.reduce(
                  (sum, i) => sum + (i.value || 0),
                  0
                )} steps`
              : "No steps synced yet"}
          </Text>
        </View>
        <Icon name="walk-outline" size={30} color="#2196F3" />
        <Switch
          value={!!userStepSync}
          onValueChange={handleStepToggle}
          style={{ marginLeft: 10 }}
        />
      </View>

      {/* Sleep Card */}
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Sync Sleep</Text>
          <Text style={styles.cardSubtitle}>
            {sleepData.length > 0
              ? `Last sync: ${sleepData[sleepData.length - 1]?.value || 0} hrs`
              : "No sleep synced yet"}
          </Text>
        </View>
        <Icon name="bed-outline" size={30} color="#4CAF50" />
        <Switch
          value={!!userSleepSync}
          onValueChange={handleSleepToggle}
          style={{ marginLeft: 10 }}
        />
      </View>
    </View>
  );
};

export default AppleHealthSync;

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
});
