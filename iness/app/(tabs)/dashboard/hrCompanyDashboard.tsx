import { safeRouter } from "@/src/utils/safeRouter";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { companyService } from "@/src/services/company.service";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";

function HrCompanyDashboard() {
  const theme = useGlobalTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await companyService.getCompanyAnalytics();
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
        setError(res?.message || "Unable to load company analytics.");
      }
    } catch (loadError: any) {
      setData(null);
      setError(loadError?.message || "Unable to load company analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const seatPct =
    data && data.seatsAllowed > 0
      ? Math.min(100, Math.round((data.seatsUsed / data.seatsAllowed) * 100))
      : 0;
  const planPct =
    data && data.activeMembers > 0
      ? Math.round((data.membersWithActivePlan / data.activeMembers) * 100)
      : 0;

  const Stat = ({ label, value, hint }: { label: string; value: any; hint?: string }) => (
    <View style={[styles.stat, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{value}</Text>
      {hint ? <Text style={[styles.statHint, { color: theme.colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );

  const Bar = ({ pct, color }: { pct: number; color: string }) => (
    <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>Company Dashboard</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : error || !data ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={42} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
            {error || "Company analytics are unavailable."}
          </Text>
          <TouchableOpacity
            onPress={load}
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={styles.row}>
            <Stat label="Seats used" value={`${data.seatsUsed}/${data.seatsAllowed}`} />
            <Stat label="Active" value={data.activeMembers} />
          </View>
          <View style={styles.row}>
            <Stat label="On a plan" value={data.membersWithActivePlan} hint={`${planPct}% of active`} />
            <Stat label="Feed posts" value={data.feedPostCount} />
          </View>

          <View style={[styles.panel, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
            <Text style={[styles.panelLabel, { color: theme.colors.text }]}>Seat utilization — {seatPct}%</Text>
            <Bar pct={seatPct} color={seatPct >= 100 ? theme.colors.error : theme.colors.primary} />
          </View>
          <View style={[styles.panel, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
            <Text style={[styles.panelLabel, { color: theme.colors.text }]}>Plan adoption — {planPct}%</Text>
            <Bar pct={planPct} color={theme.colors.success} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  back: { padding: 4 },
  title: { fontSize: 20, marginLeft: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 14, textAlign: "center", marginTop: 10, paddingHorizontal: 28 },
  retryButton: { marginTop: 14, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 14 },
  statLabel: { fontSize: 12, textTransform: "uppercase" },
  statValue: { fontSize: 26, marginTop: 4 },
  statHint: { fontSize: 11, marginTop: 2 },
  panel: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  panelLabel: { fontSize: 14 },
  barTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5 },
});

export default LoginWrapper(HrCompanyDashboard, { allowedRoles: ["hr"] });
