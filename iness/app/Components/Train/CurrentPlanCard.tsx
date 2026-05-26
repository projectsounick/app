import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { DietPlanDetails, DietPlan } from "@/app/interfaces/planInterface";
import DietPlanDetailsModal from "@/app/Modals/DietPlanDetailsModal";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

interface PlanCardProps {
  id?: string;
  title?: string;
  descItems?: string[];
  imgUrl?: string | ImageSourcePropType | null;
  isActive: boolean;
  type?: "plan" | "diet" | "manual" | "service";
  manualDescription?: string;
  dietPlanDetails?: DietPlanDetails | DietPlan;
  dietPlanUrl?: string;
  dietPlanAssignDate?: string;
}

const CurrentPlanCard: React.FC<PlanCardProps> = ({
  id,
  title,
  descItems = [],
  imgUrl,
  isActive,
  type = "plan",
  manualDescription,
  dietPlanDetails,
  dietPlanUrl,
  dietPlanAssignDate,
}) => {
  const theme = useGlobalTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const manualSummaryItems = descItems.filter(
    (item) => item && item !== manualDescription
  );
  const resolvedDescriptionItems =
    type === "manual" && manualDescription
      ? [manualDescription, ...manualSummaryItems].filter(Boolean).slice(0, 2)
      : descItems.slice(0, 2);

  const resolvedImageSource =
    typeof imgUrl === "string"
      ? { uri: imgUrl }
      : imgUrl || require("../../../assets/images/track.png");

  const handlePress = () => {
    if (type === "manual") {
      router.push({ pathname: "/dashboard/activeManualPlan" });
      return;
    }

    // For diet plans, show modal instead of navigating
    if (type === "diet" && dietPlanDetails) {
      setModalVisible(true);
      return;
    }

    if (isActive) {
      if (type === "plan" || type === "service") {
        router.push({
          pathname: "/dashboard/fullPlanDetails",
          params: { id, type },
        });
      } else {
        router.push({ pathname: "/dashboard/dietplan", params: { id } });
      }
    } else {
      router.push({ pathname: "/dashboard/completedplan", params: { id } });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={{
        borderRadius: 16,
        marginVertical: 8,
        overflow: "hidden",
        backgroundColor: theme.colors.background,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <ImageBackground
          source={resolvedImageSource}
          style={{
            width: 140,
            height: 200,
          }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.45)"]}
            style={{
              flex: 1,
              justifyContent: "space-between",
              padding: 14,
            }}
          >
            {type === "manual" ? (
              <>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.textWhite,
                      fontSize: theme.fontSizes.small,
                      fontWeight: theme.fontWeights.bold as "700",
                    }}
                  >
                    Workout Plan
                  </Text>
                </View>
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontSize: theme.fontSizes.small,
                    fontWeight: theme.fontWeights.medium as "500",
                  }}
                >
                  Full daily details
                </Text>
              </>
            ) : null}
          </LinearGradient>
        </ImageBackground>

        <View
          style={{
            flex: 1,
            padding: 16,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: theme.fontSizes.regular,
                marginBottom: 10,
                color: theme.colors.text,
                fontWeight: theme.fontWeights.bold as "700",
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title || "Untitled Plan"}
            </Text>

            <View>
              {resolvedDescriptionItems.length > 0 ? (
                resolvedDescriptionItems.map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.colors.success,
                        marginRight: 8,
                        marginTop: 5,
                      }}
                    />
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        fontSize: theme.fontSizes.small,
                        color: theme.colors.textSecondary,
                        flex: 1,
                        fontWeight: "400",
                        lineHeight: 16,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    fontSize: theme.fontSizes.small,
                    color: theme.colors.textMuted,
                    lineHeight: 16,
                    fontWeight: "400",
                  }}
                >
                  No description available.
                </Text>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.success,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 30,
                alignSelf: "flex-start",
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handlePress}
            >
              <Text
                style={{
                  color: theme.colors.textWhite,
                  fontWeight: theme.fontWeights.bold as "700",
                  fontSize: theme.fontSizes.regularSmall,
                }}
              >
                {type === "manual"
                  ? "View details"
                  : isActive
                    ? "Continue"
                    : "Check"}
              </Text>
            </TouchableOpacity>

            {type === "manual" ? (
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.fontSizes.small,
                }}
              >
                Tap card
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Diet Plan Modal */}
      {type === "diet" && (
        <DietPlanDetailsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          dietPlan={dietPlanDetails || null}
          dietPlanUrl={dietPlanUrl}
          dietPlanAssignDate={dietPlanAssignDate}
        />
      )}
    </TouchableOpacity>
  );
};

export default CurrentPlanCard;
