import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { communityService } from "@/src/services/community.service";

type FeedCenterTab = "activity" | "archive" | "analytics";

export function FeedExtrasModal({ visible, communityId, onClose, initialTab = "activity" }: {
  visible: boolean;
  communityId: string;
  onClose: () => void;
  initialTab?: FeedCenterTab;
}) {
  const theme = useGlobalTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [tab, setTab] = useState<FeedCenterTab>(initialTab);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => { if (visible) setTab(initialTab); }, [initialTab, visible]);
  const load = useCallback(async () => {
    if (!visible || !communityId) return;
    setLoading(true);
    try {
      const response = await communityService.getFeedExtras(communityId, tab);
      if (!response?.success) throw new Error(response?.message || "Unable to load feed center");
      setData(response.data);
      if (tab === "activity") void communityService.feedExtraAction({ action: "read_activity" });
    } catch (error: any) {
      Alert.alert("Feed center unavailable", error?.message || "Please try again.");
    } finally { setLoading(false); }
  }, [communityId, tab, visible]);
  useEffect(() => { void load(); }, [load]);

  const updateArchive = async (archive: any, action: "highlight" | "delete_archive" | "story_hide") => {
    setBusyId(archive._id);
    try {
      const response = await communityService.feedExtraAction({ action, archiveId: archive._id, enabled: !archive.isHighlight, title: archive.highlightTitle || "Highlights" });
      if (!response?.success) throw new Error(response?.message);
      if (action === "delete_archive") setData((current: any[]) => current.filter((item) => item._id !== archive._id));
      else setData((current: any[]) => current.map((item) => item._id === archive._id ? { ...item, isHighlight: !item.isHighlight } : item));
    } catch (error: any) { Alert.alert("Archive not updated", error?.message || "Please try again."); }
    finally { setBusyId(""); }
  };

  const renderContent = () => {
    if (loading) return <View style={styles.loading}><ActivityIndicator color={theme.colors.secondPrimary} /><Text style={styles.muted}>Loading…</Text></View>;
    if (tab === "activity") {
      const rows = Array.isArray(data) ? data : [];
      return <FlatList data={rows} keyExtractor={(item) => item._id} ListEmptyComponent={<Empty icon="notifications-outline" text="No activity yet" styles={styles} color={theme.colors.textMuted} />} renderItem={({ item }) => <View style={[styles.activityRow, !item.readAt && styles.unread]}><Avatar person={item.actor} styles={styles} /><View style={{ flex: 1 }}><Text style={styles.rowText}><Text style={styles.rowName}>{item.actor?.name || "A member"} </Text>{item.message}</Text><Text style={styles.rowMeta}>{new Date(item.createdAt).toLocaleString()}</Text></View></View>} />;
    }
    if (tab === "archive") {
      const rows = Array.isArray(data) ? data : [];
      return <FlatList numColumns={2} columnWrapperStyle={{ gap: 10 }} contentContainerStyle={{ gap: 10 }} data={rows} keyExtractor={(item) => item._id} ListEmptyComponent={<Empty icon="archive-outline" text="Your expired stories will appear here" styles={styles} color={theme.colors.textMuted} />} renderItem={({ item }) => <View style={styles.archiveCard}>{item.mediaUrl && item.mediaType === "image" ? <Image source={{ uri: item.mediaUrl }} style={styles.archiveMedia} /> : <View style={styles.archiveTextCard}><Text numberOfLines={5} style={styles.archiveText}>{item.text || "Video story"}</Text></View>}<View style={styles.archiveCounts}><Text style={styles.archiveMeta}>{item.viewerCount || 0} views · {item.replyCount || 0} replies</Text></View><View style={styles.archiveActions}><TouchableOpacity disabled={busyId === item._id} onPress={() => void updateArchive(item, "highlight")}><Ionicons name={item.isHighlight ? "star" : "star-outline"} size={19} color={item.isHighlight ? theme.colors.secondPrimary : theme.colors.textSecondary} /></TouchableOpacity><TouchableOpacity disabled={busyId === item._id} onPress={() => Alert.alert("Delete archive?", "This permanently deletes this archived story.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => void updateArchive(item, "delete_archive") }])}><Ionicons name="trash-outline" size={18} color={theme.colors.error} /></TouchableOpacity></View></View>} />;
    }
    if (tab === "analytics") {
      const totals = data?.totals || {};
      const metrics = [["Impressions", totals.impression || 0, "eye-outline"], ["Unique reach", totals.impressionUnique || 0, "people-outline"], ["Saves", totals.save || 0, "bookmark-outline"], ["Shares", totals.share || 0, "paper-plane-outline"], ["Story views", totals.storyViews || 0, "play-circle-outline"], ["Story replies", totals.storyReplies || 0, "chatbubble-outline"]];
      return <ScrollView contentContainerStyle={styles.analyticsBody}><View style={styles.metricGrid}>{metrics.map(([label, value, icon]) => <View key={String(label)} style={styles.metricCard}><Ionicons name={icon as any} size={20} color={theme.colors.secondPrimary} /><Text style={styles.metricValue}>{String(value)}</Text><Text style={styles.metricLabel}>{String(label)}</Text></View>)}</View><Text style={styles.sectionTitle}>Recent posts</Text>{(data?.posts || []).map((post: any) => <View key={post._id} style={styles.postMetricRow}><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.rowName}>{post.text || post.contentType || "Post"}</Text><Text style={styles.rowMeta}>{new Date(post.createdAt).toLocaleDateString()}</Text></View><Text style={styles.postMetricValue}>{post.metrics?.impression || 0} views</Text></View>)}</ScrollView>;
    }
    return null;
  };

  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}><View style={styles.overlay}><View style={styles.sheet}><View style={styles.header}><View><Text style={styles.title}>Feed center</Text><Text style={styles.subtitle}>Your activity, stories and insights</Text></View><TouchableOpacity onPress={onClose}><Ionicons name="close" size={25} color={theme.colors.text} /></TouchableOpacity></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>{(["activity", "archive", "analytics"] as const).map((value) => <TouchableOpacity key={value} style={[styles.tab, tab === value && styles.tabActive]} onPress={() => setTab(value)}><Text style={[styles.tabText, tab === value && styles.tabTextActive]}>{value[0].toUpperCase() + value.slice(1)}</Text></TouchableOpacity>)}</ScrollView><View style={styles.content}>{renderContent()}</View></View></View></Modal>;
}

export function StoryViewersModal({ visible, communityId, storyId, onClose }: { visible: boolean; communityId: string; storyId?: string; onClose: () => void }) {
  const theme = useGlobalTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [data, setData] = useState<any>({ viewers: [], reactions: [], replies: [] });
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!visible || !storyId) return; setLoading(true); communityService.getFeedExtras(communityId, "story_viewers", storyId).then((response: any) => { if (response?.success) setData(response.data); }).catch(() => Alert.alert("Viewers unavailable", "Please try again.")).finally(() => setLoading(false)); }, [communityId, storyId, visible]);
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}><View style={styles.overlay}><View style={[styles.sheet, { maxHeight: "72%" }]}><View style={styles.header}><View><Text style={styles.title}>Story viewers</Text><Text style={styles.subtitle}>{data.uniqueViews || 0} unique views</Text></View><TouchableOpacity onPress={onClose}><Ionicons name="close" size={25} color={theme.colors.text} /></TouchableOpacity></View>{loading ? <ActivityIndicator style={{ margin: 30 }} color={theme.colors.secondPrimary} /> : <FlatList data={data.viewers || []} keyExtractor={(item) => item._id} ListEmptyComponent={<Empty icon="eye-outline" text="No one has viewed this story yet" styles={styles} color={theme.colors.textMuted} />} renderItem={({ item }) => <View style={styles.personRow}><Avatar person={item} styles={styles} /><View style={{ flex: 1 }}><View style={styles.nameLine}><Text style={styles.rowName}>{item.name || "Member"}</Text>{item.isVerified ? <Ionicons name="checkmark-circle" size={15} color={theme.colors.secondPrimary} /> : null}</View><Text style={styles.rowMeta}>{item.verificationLabel || item.role || "member"}</Text></View></View>} />}</View></View></Modal>;
}

function Avatar({ person, styles }: any) { return person?.profilePic ? <Image source={{ uri: person.profilePic }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarInitial}>{person?.name?.[0]?.toUpperCase() || "I"}</Text></View>; }
function Empty({ icon, text, styles, color }: any) { return <View style={styles.empty}><Ionicons name={icon} size={34} color={color} /><Text style={styles.muted}>{text}</Text></View>; }

const makeStyles = (theme: any) => StyleSheet.create({
  overlay: { backgroundColor: theme.colors.overlay, flex: 1, justifyContent: "flex-end" }, sheet: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, height: "88%", padding: 18 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 20 }, subtitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: 11, marginTop: 2 },
  tabs: { gap: 7, paddingVertical: 15 }, tab: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 }, tabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, tabText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 11 }, tabTextActive: { color: theme.colors.dark, fontFamily: theme.fonts.bold }, content: { flex: 1 },
  loading: { alignItems: "center", gap: 10, justifyContent: "center", padding: 40 }, muted: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: 12, marginTop: 8, textAlign: "center" }, empty: { alignItems: "center", padding: 42 },
  activityRow: { alignItems: "center", borderBottomColor: theme.colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 11, paddingVertical: 13 }, unread: { backgroundColor: theme.colors.backgroundCardLight, borderRadius: 12, paddingHorizontal: 9 }, avatar: { borderRadius: 21, height: 42, width: 42 }, avatarFallback: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, borderRadius: 21, height: 42, justifyContent: "center", width: 42 }, avatarInitial: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold }, rowText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular, fontSize: 12 }, rowName: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 12 }, rowMeta: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: 9, marginTop: 3 }, nameLine: { alignItems: "center", flexDirection: "row", gap: 4 },
  archiveCard: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, flex: 1, overflow: "hidden" }, archiveMedia: { height: 145, width: "100%" }, archiveTextCard: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, height: 145, justifyContent: "center", padding: 14 }, archiveText: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 14, textAlign: "center" }, archiveCounts: { paddingHorizontal: 9, paddingTop: 8 }, archiveMeta: { color: theme.colors.textMuted, fontSize: 9 }, archiveActions: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  analyticsBody: { paddingBottom: 30 }, metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, metricCard: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, padding: 13, width: "31%" }, metricValue: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 20, marginTop: 7 }, metricLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.medium, fontSize: 9, marginTop: 2 }, sectionTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 14, marginBottom: 6, marginTop: 20 }, postMetricRow: { alignItems: "center", borderBottomColor: theme.colors.border, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 11 }, postMetricValue: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 11 },
  personRow: { alignItems: "center", borderBottomColor: theme.colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 10, paddingVertical: 12 },
});
