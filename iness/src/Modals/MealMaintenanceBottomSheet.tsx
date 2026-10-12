import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";

const { width } = Dimensions.get("window");

interface MealMaintenanceBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export default function MealMaintenanceBottomSheet({
  visible,
  onClose,
  message,
}: MealMaintenanceBottomSheetProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();

  const handleClose = () => {
    Haptics.selectionAsync().catch(() => {});
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: isDark ? "#1A1D24" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              {/* Top Handle */}
              <View
                style={[
                  styles.handle,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" },
                ]}
              />

              {/* Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? "#FFFFFF" : "#1A1D24"}
                />
              </TouchableOpacity>

              {/* Icon Container with glowing gradient */}
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name="construct" size={38} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.pulseBadge}>
                  <Text style={styles.badgeText}>UPGRADE</Text>
                </View>
              </View>

              {/* Title & Description */}
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#FFFFFF" : "#111827" },
                ]}
              >
                Meal Logging Under Maintenance
              </Text>

              <Text
                style={[
                  styles.description,
                  { color: isDark ? "#9CA3AF" : "#4B5563" },
                ]}
              >
                {message ||
                  "We're currently fine-tuning our AI Nutrition engine to give you faster scans, sharper OCR labels, and more accurate macros. Meal logging will be back online shortly!"}
              </Text>

              {/* Status Note Box */}
              <View
                style={[
                  styles.noteBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(245, 158, 11, 0.12)"
                      : "rgba(245, 158, 11, 0.08)",
                    borderColor: isDark
                      ? "rgba(245, 158, 11, 0.3)"
                      : "rgba(245, 158, 11, 0.2)",
                  },
                ]}
              >
                <Ionicons name="time-outline" size={18} color="#F59E0B" />
                <Text
                  style={[
                    styles.noteText,
                    { color: isDark ? "#FCD34D" : "#B45309" },
                  ]}
                >
                  Existing logged meals and streaks remain 100% safe and intact.
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.85}
                style={styles.actionButtonContainer}
              >
                <LinearGradient
                  colors={[
                    theme.colors.secondPrimary || "#9747FF",
                    theme.colors.secondPrimary || "#7C3AED",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Got It</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  pulseBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
  },
  badgeText: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    width: "100%",
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
  actionButtonContainer: {
    width: "100%",
  },
  actionButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
