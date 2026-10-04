import { safeRouter } from "@/src/utils/safeRouter";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { notificationService } from "@/src/services/notification.service";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";

const PLATFORMS = [
  { key: undefined, label: "All" },
  { key: "ios" as const, label: "iOS" },
  { key: "android" as const, label: "Android" },
];

function AdminSendNotification() {
  const theme = useGlobalTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android" | undefined>(undefined);
  const [sending, setSending] = useState(false);

  const send = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Missing", "Title and message are required.");
      return;
    }
    Alert.alert(
      "Send notification",
      `Send to ${platform ? platform : "all"} users?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            setSending(true);
            try {
              const res = await notificationService.broadcastNotification(
                title.trim(),
                body.trim(),
                platform
              );
              if (res.success) {
                Alert.alert("Sent", res.message || "Notification sent.");
                setTitle("");
                setBody("");
              } else {
                Alert.alert("Error", res.message || "Failed to send.");
              }
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to send.");
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>Send Notification</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. New challenge is live!"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Message</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Write the notification body…"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              style={[styles.input, styles.multiline, { color: theme.colors.text, backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Audience</Text>
            <View style={styles.segRow}>
              {PLATFORMS.map((p) => {
                const active = platform === p.key;
                return (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => setPlatform(p.key)}
                    style={[
                      styles.seg,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.backgroundCard,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? "#fff" : theme.colors.text, fontSize: 14 }}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={send}
            disabled={sending}
            style={[styles.sendBtn, { backgroundColor: theme.colors.primary, opacity: sending ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons name="send" size={18} color="#fff" />
            <Text style={styles.sendText}>{sending ? "Sending…" : "Send to users"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  back: { padding: 4 },
  title: { fontSize: 20, marginLeft: 4 },
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  segRow: { flexDirection: "row", gap: 10 },
  seg: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  sendBtn: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 999, marginTop: 8 },
  sendText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

export default LoginWrapper(AdminSendNotification, { allowedRoles: ["admin"] });
