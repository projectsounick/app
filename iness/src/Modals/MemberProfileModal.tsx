import React, { memo } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";

export type MemberProfileData = {
  userId: string;
  name: string;
  profilePic?: string | null;
  role?: string;
  isVerified?: boolean;
  totalStreak?: number;
};

interface MemberProfileModalProps {
  visible: boolean;
  onClose: () => void;
  member: MemberProfileData | null;
}

const { width } = Dimensions.get("window");

function MemberProfileModal({
  visible,
  onClose,
  member,
}: MemberProfileModalProps) {
  const theme = useGlobalTheme();
  const styles = getStyles(theme);

  if (!member) return null;

  const streakDays = typeof member.totalStreak === "number" ? member.totalStreak : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Member Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close profile"
            >
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Avatar and Identity */}
          <View style={styles.identitySection}>
            <View style={styles.avatarWrap}>
              {member.profilePic ? (
                <Image
                  source={{ uri: member.profilePic }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {member.name?.[0]?.toUpperCase() || "M"}
                  </Text>
                </View>
              )}
              {streakDays > 0 ? (
                <View style={styles.streakIndicatorDot}>
                  <Ionicons name="flame" size={14} color="#FFF" />
                </View>
              ) : null}
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>
                {member.name}
              </Text>
              {member.isVerified ? (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.colors.secondPrimary}
                />
              ) : null}
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {member.role ? member.role.toUpperCase() : "COMMUNITY MEMBER"}
              </Text>
            </View>
          </View>

          {/* Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <View style={styles.streakIconCircle}>
                <Ionicons name="flame" size={26} color="#FF7A00" />
              </View>
              <View>
                <Text style={styles.streakNumber}>
                  {streakDays} {streakDays === 1 ? "Day" : "Days"}
                </Text>
                <Text style={styles.streakLabel}>Daily Consistency Streak</Text>
              </View>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>
                {streakDays > 0 ? "🔥 ACTIVE" : "STARTED"}
              </Text>
            </View>
          </View>

          {/* Motivational Note */}
          <View style={styles.noteBox}>
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={theme.colors.secondPrimary}
            />
            <Text style={styles.noteText}>
              Showing up every day for fitness, wellness, and healthy living in
              the Iness community.
            </Text>
          </View>

          {/* Action button: Done */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Done viewing profile"
          >
            <Text style={styles.doneButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.72)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: Math.min(width - 40, 360),
      backgroundColor: theme.colors.background,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 22,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    headerTitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontFamily: theme.fonts.bold,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    closeBtn: {
      padding: 4,
    },
    identitySection: {
      alignItems: "center",
      marginBottom: 18,
    },
    avatarWrap: {
      position: "relative",
      marginBottom: 12,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2.5,
      borderColor: "#FF7A00",
    },
    avatarFallback: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 2.5,
      borderColor: "#FF7A00",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitial: {
      fontSize: 28,
      fontFamily: theme.fonts.bold,
      color: "#FF7A00",
    },
    streakIndicatorDot: {
      position: "absolute",
      bottom: -2,
      right: -2,
      backgroundColor: "#FF5722",
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    nameText: {
      color: theme.colors.text,
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      maxWidth: 240,
    },
    roleBadge: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    roleText: {
      color: theme.colors.secondPrimary,
      fontSize: 10,
      fontFamily: theme.fonts.bold,
      letterSpacing: 0.6,
    },
    streakCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(255, 122, 0, 0.08)",
      borderWidth: 1.2,
      borderColor: "rgba(255, 122, 0, 0.25)",
      borderRadius: 16,
      padding: 14,
      marginBottom: 14,
    },
    streakLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    streakIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255, 122, 0, 0.16)",
      justifyContent: "center",
      alignItems: "center",
    },
    streakNumber: {
      color: theme.colors.text,
      fontSize: 18,
      fontFamily: theme.fonts.bold,
    },
    streakLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontFamily: theme.fonts.regular,
      marginTop: 2,
    },
    activePill: {
      backgroundColor: "#FF5722",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    activePillText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontFamily: theme.fonts.bold,
    },
    noteBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    noteText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontFamily: theme.fonts.regular,
      lineHeight: 16,
    },
    doneButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    doneButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontFamily: theme.fonts.bold,
    },
  });

export default memo(MemberProfileModal);
