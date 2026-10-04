import { safeRouter } from "@/src/utils/safeRouter";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { companyService } from "@/src/services/company.service";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";

function HrCompanyMembers() {
  const theme = useGlobalTheme();
  const [members, setMembers] = useState<any[]>([]);
  const [seats, setSeats] = useState<{ used: number; allowed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await companyService.getCompanyMembers();
      if (res?.success) {
        setMembers(res.data || []);
        setSeats(res.seats || null);
      } else Alert.alert("Unable to load members", res?.message || "Please try again.");
    } catch (e: any) {
      Alert.alert("Unable to load members", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggle = (m: any, active: boolean) => {
    Alert.alert(
      active ? "Reactivate member" : "Remove member",
      active
        ? `Reactivate ${m.name || m.email}?`
        : `Remove ${m.name || m.email}? This frees their seat and revokes their plan.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: active ? "Reactivate" : "Remove",
          style: active ? "default" : "destructive",
          onPress: async () => {
            try {
              const res: any = await companyService.setMemberActive(m._id, active);
              if (res?.success) load();
              else Alert.alert("Error", res?.message || "Failed");
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed");
            }
          },
        },
      ]
    );
  };

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>My Members</Text>
        {seats ? (
          <View style={[styles.seatChip, { backgroundColor: seats.used >= seats.allowed ? theme.colors.error : theme.colors.primary }]}>
            <Text style={styles.seatChipText}>{seats.used}/{seats.allowed} seats</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
        <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textMuted} />
        <TextInput
          placeholder="Search members"
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={[styles.search, { color: theme.colors.text }]}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m._id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>No members yet</Text>
          }
          renderItem={({ item: m }) => (
            <View style={[styles.card, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.fonts.medium }]}>
                  {m.name || "—"} {m.isActive ? "" : "· inactive"}
                </Text>
                <Text style={[styles.sub, { color: theme.colors.textMuted }]}>{m.email}</Text>
                {m.goal ? <Text style={[styles.sub, { color: theme.colors.textMuted }]}>Goal: {m.goal}</Text> : null}
              </View>
              <TouchableOpacity
                onPress={() => toggle(m, !m.isActive)}
                style={[styles.action, { borderColor: m.isActive ? theme.colors.error : theme.colors.success }]}
              >
                <Text style={{ color: m.isActive ? theme.colors.error : theme.colors.success, fontSize: 13 }}>
                  {m.isActive ? "Remove" : "Restore"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, gap: 6 },
  back: { padding: 4 },
  title: { fontSize: 20, flex: 1 },
  seatChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  seatChipText: { color: "#fff", fontSize: 12 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  search: { flex: 1, paddingVertical: 8, fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", marginTop: 40 },
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, padding: 14 },
  name: { fontSize: 15 },
  sub: { fontSize: 12, marginTop: 2 },
  action: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
});

export default LoginWrapper(HrCompanyMembers, { allowedRoles: ["hr"] });
