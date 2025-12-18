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
import theme from "../Theme/globalTheme";

const { height } = Dimensions.get("window");

interface DietPlanBottomsheet {
  visible: boolean;
  onClose: () => void;
}

export default function DietPlanBottomSheet({
  visible,
  onClose,
}: DietPlanBottomsheet) {
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
          {/* Handle Bar */}
          <View
            style={{
              width: 40,
              height: 3,
              backgroundColor: "#D0D0D0",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="restaurant-outline" size={18} color="#9747FF" />
              </View>
              <Text style={styles.headerText}>Diet Plan</Text>
            </View>
            <View style={styles.headerRight}>
              {selectedPlan && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={handleDownload}
                  disabled={loading}
                >
                  <Ionicons name="download-outline" size={18} color="#67C694" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Dropdown */}
          {menuOpen && (
            <View style={styles.menuList}>
              <ScrollView>
                {dietPlans.length > 0 ? (
                  dietPlans.map((plan, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => {
                        setSelectedPlan(plan);
                        setMenuOpen(false);
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <Text
                          style={{
                            color: plan === selectedPlan ? "#67C694" : "#666",
                            fontWeight: plan === selectedPlan ? "700" : "500",
                            fontSize: 14,
                            flex: 1,
                          }}
                        >
                          Diet Plan {index + 1}
                        </Text>
                        {plan === selectedPlan && (
                          <Ionicons name="checkmark-circle" size={20} color="#67C694" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noPlansText}>No Plans</Text>
                )}
              </ScrollView>
            </View>
          )}

          {/* WebView */}
          <View
            style={{
              flex: 1,
              marginTop: 10,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#F9F9F9",
              position: "relative",
            }}
          >
            {selectedPlan ? (
              <>
                <WebView
                  source={{ uri: selectedPlan }}
                  style={{ flex: 1 }}
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => setLoading(false)}
                />
                {loading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 12,
                    }}
                  >
                    <ActivityIndicator size="large" color="#67C694" />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: "#F3EDFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="document-text-outline" size={32} color="#9747FF" />
                </View>
                <Text style={styles.emptyText}>Select a diet plan to view</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: height * 0.9,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F5F5F5",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  menuList: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    width: 180,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  noPlansText: {
    color: "#000",
    textAlign: "center",
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
});
