import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { fetchWrapper } from "@/app/helpers/fetchWrapper";
import { config } from "@/app/shared/config";

const baseUrl = `${config.apiUrl}/api`;

interface DietPlan {
  _id: string;
  title: string;
  description?: string;
  duration?: number;
  durationType?: string;
  mealCount?: number;
  calorieRange?: string;
  isActive: boolean;
  createdAt: string;
}

function AssignDietPlan() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const userName = params.userName as string;

  const [loading, setLoading] = useState(true);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    try {
      setLoading(true);
      const response = await fetchWrapper.get(`${baseUrl}/get-diet-plan?isActive=true`);
      if (response.success) {
        setDietPlans(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching diet plans:", error);
      Alert.alert("Error", "Failed to fetch diet plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedPlanId) {
      Alert.alert("Error", "Please select a diet plan");
      return;
    }

    Alert.alert(
      "Assign Diet Plan",
      `Are you sure you want to assign this diet plan to ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: async () => {
            try {
              setAssigning(true);
              const response = await fetchWrapper.post(`${baseUrl}/assign-diet-plan`, {
                userId: userId,
                dietPlanId: selectedPlanId,
              });

              if (response.success) {
                Alert.alert("Success", "Diet plan assigned successfully", [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert("Error", response.message || "Failed to assign diet plan");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to assign diet plan");
            } finally {
              setAssigning(false);
            }
          },
        },
      ]
    );
  };

  const filteredPlans = dietPlans.filter((plan) =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assign Diet Plan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.loadingText}>Loading diet plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Assign Diet Plan</Text>
          <Text style={styles.headerSubtitle}>to {userName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search diet plans..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Diet Plans List */}
        {filteredPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="nutrition-outline" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>
              {searchQuery ? "No diet plans found" : "No diet plans available"}
            </Text>
          </View>
        ) : (
          filteredPlans.map((plan) => {
            const isSelected = selectedPlanId === plan._id;
            return (
              <TouchableOpacity
                key={plan._id}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlanId(plan._id)}
                activeOpacity={0.7}
              >
                <View style={styles.planCardHeader}>
                  <View style={styles.radioContainer}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.planCardContent}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    {plan.description && (
                      <Text style={styles.planDescription} numberOfLines={2}>
                        {plan.description}
                      </Text>
                    )}
                    <View style={styles.planMeta}>
                      {plan.duration && (
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                          <Text style={styles.metaText}>
                            {plan.duration} {plan.durationType || "days"}
                          </Text>
                        </View>
                      )}
                      {plan.mealCount && (
                        <View style={styles.metaItem}>
                          <Ionicons name="restaurant-outline" size={14} color={theme.colors.textMuted} />
                          <Text style={styles.metaText}>{plan.mealCount} meals/day</Text>
                        </View>
                      )}
                      {plan.calorieRange && (
                        <View style={styles.metaItem}>
                          <Ionicons name="flash-outline" size={14} color={theme.colors.textMuted} />
                          <Text style={styles.metaText}>{plan.calorieRange} cal</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Assign Button */}
        {filteredPlans.length > 0 && (
          <TouchableOpacity
            style={[styles.assignButton, !selectedPlanId && styles.assignButtonDisabled]}
            onPress={handleAssignPlan}
            disabled={!selectedPlanId || assigning}
            activeOpacity={0.8}
          >
            {assigning ? (
              <ActivityIndicator size="small" color={theme.colors.textWhite} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.textWhite} />
                <Text style={styles.assignButtonText}>Assign Selected Plan</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
    },
    headerContent: {
      flex: 1,
      marginLeft: 12,
    },
    headerTitle: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    planCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    planCardSelected: {
      borderColor: theme.colors.text,
      backgroundColor: isDark ? theme.colors.text + "15" : theme.colors.text + "08",
    },
    planCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    radioContainer: {
      paddingTop: 2,
      marginRight: 12,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioOuterSelected: {
      borderColor: theme.colors.text,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.text,
    },
    planCardContent: {
      flex: 1,
    },
    planTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 6,
    },
    planDescription: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginBottom: 10,
      lineHeight: 18,
    },
    planMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
    },
    assignButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
      marginBottom: 32,
      gap: 10,
    },
    assignButtonDisabled: {
      opacity: 0.5,
    },
    assignButtonText: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
    },
  });

export default AssignDietPlan;
