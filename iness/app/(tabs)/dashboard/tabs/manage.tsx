import { safeRouter } from "@/src/utils/safeRouter";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";

type Tile = {
  label: string;
  desc: string;
  icon: any;
  route: string;
};

const ROLE_TILES: Record<string, Tile[]> = {
  admin: [
    { label: "Users & Sessions", desc: "All clients, plans & session marking", icon: "account-group", route: "/dashboard/trainerDashboard" },
    { label: "Companies", desc: "Corporate accounts, seats & plans", icon: "office-building", route: "/dashboard/adminCompanies" },
    { label: "Send Notification", desc: "Push an update to users", icon: "bell-ring", route: "/dashboard/adminSendNotification" },
  ],
  trainer: [
    { label: "My Clients", desc: "Your assigned clients & sessions", icon: "account-group", route: "/dashboard/trainerDashboard" },
  ],
  hr: [
    { label: "Company Dashboard", desc: "Seats, members & engagement", icon: "view-dashboard", route: "/dashboard/hrCompanyDashboard" },
    { label: "Members", desc: "Your company's members", icon: "account-multiple", route: "/dashboard/hrCompanyMembers" },
    { label: "Company Feed", desc: "Post & moderate your feed", icon: "message-text", route: "/dashboard/hrCompanyFeed" },
  ],
};

const ROLE_TITLE: Record<string, string> = {
  admin: "Admin Panel",
  trainer: "Trainer Panel",
  hr: "Company Admin",
};

function Manage() {
  const theme = useGlobalTheme();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const u = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage<any>("user");
          if (active && u.exists) {
            setRole(u.data?.role || null);
            setName(u.data?.name || "");
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const tiles = role ? ROLE_TILES[role] || [] : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
          {role ? ROLE_TITLE[role] || "Manage" : "Manage"}
        </Text>
        {name ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fonts.regular }]}>
            {name}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : tiles.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="shield-lock-outline" size={48} color={theme.colors.textMuted} />
          <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
            No management tools for this account.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {tiles.map((t) => (
            <TouchableOpacity
              key={t.route}
              activeOpacity={0.85}
              style={[
                styles.card,
                { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border },
              ]}
              onPress={() => safeRouter.navigate(t.route as any)}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.background }]}>
                <MaterialCommunityIcons name={t.icon} size={26} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.fonts.medium }]}>
                {t.label}
              </Text>
              <Text style={[styles.cardDesc, { color: theme.colors.textMuted, fontFamily: theme.fonts.regular }]}>
                {t.desc}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.textMuted}
                style={styles.chev}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  empty: { fontSize: 14, textAlign: "center" },
  grid: { padding: 16, gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, marginBottom: 4 },
  cardDesc: { fontSize: 13, paddingRight: 24 },
  chev: { position: "absolute", right: 14, top: 20 },
});

export default LoginWrapper(Manage);
