import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../Theme/ThemeContext";

const { height } = Dimensions.get("window");

interface DietPlanBottomsheet {
  visible: boolean;
  onClose: () => void;
}

export default function DietPlanBottomSheet({
  visible,
  onClose,
}: DietPlanBottomsheet) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [dietPlans, setDietPlans] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchPlans = async () => {
      const stored = await AsyncStorage.getItem("dietplans");
      if (stored) {
        const plans = JSON.parse(stored);
        setDietPlans(plans);
        if (!selectedPlan && plans.length > 0) setSelectedPlan(plans[0]);
      }
      setLoading(false);
    };
    fetchPlans();
  }, [visible]);

  // Hide navigation bar when modal opens - keep it hidden continuously
  useEffect(() => {
    if (Platform.OS === "android") {
      if (visible) {
        // When modal is visible, aggressively hide navigation bar
        NavigationBar.setVisibilityAsync("hidden");
        NavigationBar.setBehaviorAsync("overlay-swipe");
        SystemNavigationBar.stickyImmersive();

        // Set up interval to continuously hide it (Android sometimes shows it automatically)
        const interval = setInterval(() => {
          NavigationBar.setVisibilityAsync("hidden");
          SystemNavigationBar.stickyImmersive();
        }, 100);

        return () => clearInterval(interval);
      } else {
        // When modal closes, ensure it stays hidden
        NavigationBar.setVisibilityAsync("hidden");
        SystemNavigationBar.stickyImmersive();
      }
    }
  }, [visible]);

  const handleDownload = async () => {
    if (!selectedPlan) {
      Alert.alert("No Plan Selected", "Please select a diet plan to download.");
      return;
    }

    try {
      setLoading(true);
      const fileName = `diet-plan-${Date.now()}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(selectedPlan, fileUri);

      if (downloadResult.status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: "application/pdf",
            dialogTitle: "Your Diet Plan",
          });
        } else {
          Alert.alert("Success", "Diet plan downloaded successfully!");
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to download diet plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Gradient Header */}
          <LinearGradient
            colors={["#844ACF", "#432569"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Handle Bar */}
            <View style={styles.handle} />

            {/* Header Content */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={["#9747FF", "#844ACF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="restaurant" size={22} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.headerText}>Diet Plan</Text>
              </View>
              <View style={styles.headerRight}>
                {selectedPlan && (
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={handleDownload}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuOpen(!menuOpen)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Menu Dropdown */}
          {menuOpen && (
            <View style={styles.menuList}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {dietPlans.length > 0 ? (
                  dietPlans.map((plan, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.menuItem,
                        plan === selectedPlan && styles.menuItemActive,
                      ]}
                      onPress={() => {
                        setSelectedPlan(plan);
                        setMenuOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemContent}>
                        <Ionicons
                          name="document-text"
                          size={18}
                          color={plan === selectedPlan ? theme.colors.secondPrimary : "#666"}
                          style={styles.menuItemIcon}
                        />
                        <Text
                          style={[
                            styles.menuItemText,
                            plan === selectedPlan && styles.menuItemTextActive,
                          ]}
                        >
                          Diet Plan {index + 1}
                        </Text>
                        {plan === selectedPlan && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.secondPrimary}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noPlansContainer}>
                    <Ionicons name="document-outline" size={32} color="#999" />
                    <Text style={styles.noPlansText}>No Diet Plans Available</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* WebView Container */}
          <View style={styles.webViewWrapper}>
            {selectedPlan ? (
              <>
                <WebView
                  source={{ uri: selectedPlan }}
                  style={styles.webView}
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => setLoading(false)}
                />
                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
                    <Text style={styles.loadingText}>Loading diet plan...</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={["#F3EDFF", "#E8D5FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyIconContainer}
                >
                  <Ionicons name="document-text-outline" size={40} color={theme.colors.secondPrimary} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No Diet Plan Selected</Text>
                <Text style={styles.emptyText}>
                  Select a diet plan from the menu above to view it here
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    height: height * 0.9,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: theme.colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.bold,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  menuList: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingVertical: 8,
    width: 200,
    maxHeight: 240,
    shadowColor: theme.colors.secondPrimary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: `${theme.colors.secondPrimary}10`,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  menuItemTextActive: {
    color: theme.colors.secondPrimary,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  noPlansContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noPlansText: {
    marginTop: 12,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  webViewWrapper: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.backgroundSecondary,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background + "F2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptyText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
});
