import { safeRouter } from "@/src/utils/safeRouter";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { companyService } from "@/src/services/company.service";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";

function HrCompanyFeed() {
  const theme = useGlobalTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await companyService.getCompanyFeed();
      if (res?.success) {
        setPosts(res.data || []);
        setCommunity(res.community || null);
      } else Alert.alert("Unable to load feed", res?.message || "Please try again.");
    } catch (e: any) {
      Alert.alert("Unable to load feed", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submit = async () => {
    const t = text.trim();
    if (!t || !community?._id) return;
    setPosting(true);
    try {
      const res: any = await companyService.createCompanyPost(community._id, t);
      if (res?.success) {
        setText("");
        load();
      } else {
        Alert.alert("Error", res?.message || "Failed to post");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const remove = (postId: string) => {
    Alert.alert("Delete post", "Remove this post from the feed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res: any = await companyService.deletePost(postId);
            if (res?.success) setPosts((p) => p.filter((x) => x._id !== postId));
            else Alert.alert("Error", res?.message || "Failed");
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]} numberOfLines={1}>
          {community?.name || "Company Feed"}
        </Text>
        {community ? (
          <Text style={[styles.count, { color: theme.colors.textMuted }]}>{community.memberCount} members</Text>
        ) : null}
      </View>

      <View style={[styles.composer, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
        <TextInput
          placeholder="Share an update with your company..."
          placeholderTextColor={theme.colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          style={[styles.input, { color: theme.colors.text }]}
        />
        <TouchableOpacity
          onPress={submit}
          disabled={posting || !text.trim()}
          style={[styles.postBtn, { backgroundColor: theme.colors.primary, opacity: posting || !text.trim() ? 0.5 : 1 }]}
        >
          <Text style={styles.postBtnText}>{posting ? "Posting…" : "Post"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p._id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>No posts yet.</Text>
          }
          renderItem={({ item: p }) => (
            <View style={[styles.post, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
              <View style={styles.postHead}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.author, { color: theme.colors.text, fontFamily: theme.fonts.medium }]}>
                    {p.createdBy?.name || "Member"}
                  </Text>
                  <Text style={[styles.time, { color: theme.colors.textMuted }]}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => remove(p._id)} style={{ padding: 4 }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              {p.text ? (
                <Text style={[styles.body, { color: theme.colors.text }]}>{p.text}</Text>
              ) : null}
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                {(p.likeCount ?? 0)} likes · {(p.commentCount ?? 0)} comments
              </Text>
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
  title: { fontSize: 18, flex: 1 },
  count: { fontSize: 12 },
  composer: { marginHorizontal: 16, borderWidth: 1, borderRadius: 14, padding: 12 },
  input: { minHeight: 44, fontSize: 14, textAlignVertical: "top" },
  postBtn: { alignSelf: "flex-end", marginTop: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 },
  postBtnText: { color: "#fff", fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", marginTop: 40 },
  post: { borderWidth: 1, borderRadius: 14, padding: 14 },
  postHead: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  author: { fontSize: 14 },
  time: { fontSize: 11, marginTop: 1 },
  body: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 11, marginTop: 10 },
});

export default LoginWrapper(HrCompanyFeed, { allowedRoles: ["hr"] });
