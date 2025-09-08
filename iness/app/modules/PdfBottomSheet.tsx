import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
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

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.menuButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>

            <Text style={styles.headerText}>Diet Plan</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#000" />
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
                      style={[
                        styles.menuItem,
                        plan === selectedPlan && {
                          backgroundColor: theme.primary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedPlan(plan); // Replace current plan
                      }}
                    >
                      <Text
                        style={{
                          color: plan === selectedPlan ? "#000" : "#000",
                          fontWeight: plan === selectedPlan ? "700" : "500",
                        }}
                      >
                        Diet Plan {index + 1}
                      </Text>
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
              backgroundColor: "#f0f0f0",
            }}
          >
            {loading && selectedPlan && (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                visible={!loading}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  marginHorizontal: 5,
                }}
              />
            )}

            {selectedPlan ? (
              <WebView
                source={{ uri: selectedPlan }}
                style={{ flex: 1 }}
                onLoadEnd={() => setLoading(false)}
              />
            ) : (
              <View style={styles.emptyContainer}>
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  menuList: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 5,
    width: 180,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
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
    fontSize: 16,
    color: "#666",
  },
});
