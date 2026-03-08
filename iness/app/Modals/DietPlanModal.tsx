import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DietPlanDetails } from "../interfaces/planInterface";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { planService } from "../services/plan.service";

interface DietPlanInfoModalProps {
  dietPlan?: DietPlanDetails;
}

const DietPlanInfoModal: React.FC<DietPlanInfoModalProps> = ({ dietPlan: propDietPlan }) => {
  const theme = useGlobalTheme();
  const [visible, setVisible] = useState(false);
  const [dietPlanData, setDietPlanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchDietPlan();
    }
  }, [visible]);

  const fetchDietPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching diet plan data...");
      const response = await planService.getUserDietPlan();
      console.log("Diet plan API response:", response);
      if (response.success) {
        setDietPlanData(response.data);
        console.log("Diet plan data set:", response.data);
      } else {
        setError("Failed to load diet plan");
      }
    } catch (err: any) {
      console.error("Error fetching diet plan:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Prioritize fetched data over prop data
  const dietPlan = (dietPlanData.length > 0 ? dietPlanData[0]?.dietPlanId || dietPlanData[0]?.plan?.planId?.dietPlanId : null) || propDietPlan;

  return (
    <>
      {/* Trigger section */}
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        <Ionicons
          name="fast-food-outline"
          size={18}
          color={theme.colors.text}
        />
        <Text
          style={{
            marginLeft: 8,
            fontSize: theme.fontSizes.regular,
            color: theme.colors.text,
            fontWeight: theme.fontWeights.medium as "500",
          }}
        >
          Diet Plan Included
        </Text>

        {/* Spacer pushes right icon to the far right */}
        <View style={{ flex: 1 }} />

        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color={theme.colors.text}
        />
      </Pressable>

      {/* Modal section */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 12,
              width: "85%",
              maxHeight: "80%",
              paddingTop: 16,
              paddingHorizontal: 20,
              paddingBottom: 24,
            }}
          >
            {/* Close Icon */}
            <Pressable
              onPress={() => setVisible(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: theme.colors.backgroundSecondary,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </Pressable>

            {/* Scrollable Content */}
            <ScrollView
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>Loading diet plan...</Text>
                </View>
              ) : error ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                  <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                  <Text style={{ marginTop: 12, color: theme.colors.error, textAlign: "center" }}>{error}</Text>
                </View>
              ) : !dietPlan ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                  <Ionicons name="nutrition-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={{ marginTop: 12, color: theme.colors.textSecondary, textAlign: "center" }}>No diet plans available</Text>
                </View>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                      marginBottom: 12,
                      color: theme.colors.text,
                      textAlign: "center",
                    }}
                  >
                    {dietPlan.title}
                  </Text>

                  <Text
                    style={{
                      fontSize: theme.fontSizes.regularSmall,
                      color: theme.colors.textSecondary,
                      marginBottom: 16,
                      textAlign: "center",
                    }}
                  >
                    Duration: {dietPlan.duration} {dietPlan.durationType}
                    {dietPlan.duration > 1 ? "s" : ""}
                  </Text>

                  <View style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        fontSize: theme.fontSizes.regular,
                        fontWeight: theme.fontWeights.medium as "500",
                        marginBottom: 10,
                        color: theme.colors.text,
                      }}
                    >
                      Highlights
                    </Text>

                    {dietPlan.descItems && dietPlan.descItems.map((item: string, idx: number) => (
                      <View
                        key={idx}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Ionicons name="leaf-outline" size={18} color="#10B981" />
                        <Text style={{ marginLeft: 8, fontSize: theme.fontSizes.regularSmall }}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DietPlanInfoModal;
