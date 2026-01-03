import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Animated,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { withAuthGuard } from "@/app/Hoc/WithAuthGuardButton";
import theme from "@/app/Theme/globalTheme";
const ProtectedAnimatedSubmitButton = withAuthGuard(AnimatedSubmitButton);
interface Props {
  screenWidth: number;
  cartLoading: boolean;
  currentPlan: any;
  selectedPlanItem: string;
  setSelectedPlanItem: (id: string) => void;
  setBottomSectionHeight: (height: number) => void;
  addingIntoToCart: (type: string) => void;
  theme: any;
  bottomSectionHeight: any;
  showBottomBar: boolean;
}

const DietPlanInfo: React.FC<Props> = ({
  screenWidth,
  cartLoading,
  currentPlan,
  selectedPlanItem,
  setSelectedPlanItem,
  setBottomSectionHeight,
  addingIntoToCart,
  theme,
  bottomSectionHeight,
  showBottomBar,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;

  const planDetails = currentPlan?.dietPlanDetails ?? currentPlan;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "transparent", paddingHorizontal: 16 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: bottomSectionHeight + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Overview Card */}
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: theme.colors.dark,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: theme.colors.backgroundCardLight,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="information-circle" size={22} color={theme.colors.secondPrimary} />
              </View>
              <Text
                style={{
                  fontSize: theme.fontSizes.large,
                  fontWeight: theme.fontWeights.bold as "700",
                  color: theme.colors.text,
                }}
              >
                Overview
              </Text>
            </View>
            <Text
              style={{
                fontSize: theme.fontSizes.regular,
                color: theme.colors.textSecondary,
                lineHeight: 22,
              }}
            >
              {planDetails?.desc}
            </Text>
          </View>

          {/* Desc Items Card */}
          {planDetails?.descItems && (
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                shadowColor: theme.colors.dark,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: theme.colors.backgroundCardLight,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.secondPrimary} />
                </View>
                <Text
                  style={{
                    fontSize: theme.fontSizes.medium,
                    fontWeight: theme.fontWeights.bold as "700",
                    color: theme.colors.text,
                  }}
                >
                  What it provides
                </Text>
              </View>
              {planDetails.descItems.map((item: string, idx: number) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 14,
                    marginLeft: 6,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      backgroundColor: theme.colors.backgroundCardLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      marginTop: 1,
                    }}
                  >
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.regularSmall,
                      color: theme.colors.text,
                      flex: 1,
                      lineHeight: 22,
                      fontWeight: theme.fontWeights.medium as "500",
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Diet Plan Download Button */}
          {currentPlan?.dietPlanDetails && currentPlan?.dietPlanUrl && (
            <TouchableOpacity
              onPress={() => Linking.openURL(currentPlan.dietPlanUrl)}
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.colors.background,
                padding: 20,
                borderRadius: 20,
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: theme.colors.dark,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: theme.colors.greenLight,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={24}
                    color={theme.colors.success}
                  />
                </View>
                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.medium as "500",
                    color: theme.colors.text,
                    flex: 1,
                  }}
                >
                  Download your diet plan
                </Text>
              </View>
              <Ionicons
                name="cloud-download-outline"
                size={26}
                color={theme.colors.secondPrimary}
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Bottom Bar */}
      {showBottomBar && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: screenWidth,
            transform: [{ translateY }],
          }}
          onLayout={(event) =>
            setBottomSectionHeight(event.nativeEvent.layout.height)
          }
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              paddingTop: 12,
              paddingLeft: Math.min(20, screenWidth * 0.05),
              paddingRight: Math.min(20, screenWidth * 0.05),
              paddingBottom: 12,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: theme.colors.dark,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlanItem(currentPlan._id);
                }}
                activeOpacity={0.7}
                style={{
                  width: "100%",
                  maxWidth: Math.min(400, screenWidth * 0.9),
                  backgroundColor:
                    selectedPlanItem === currentPlan._id
                      ? theme.colors.backgroundCardLight
                      : theme.colors.background,
                  borderWidth: selectedPlanItem === currentPlan._id ? 2 : 1.5,
                  borderColor:
                    selectedPlanItem === currentPlan._id
                      ? theme.colors.secondPrimary
                      : theme.colors.border,
                  borderRadius: 14,
                  padding: 10,
                  paddingVertical: 12,
                  shadowColor: selectedPlanItem === currentPlan._id ? theme.colors.secondPrimary : theme.colors.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedPlanItem === currentPlan._id ? 0.15 : 0.08,
                  shadowRadius: selectedPlanItem === currentPlan._id ? 6 : 4,
                  elevation: selectedPlanItem === currentPlan._id ? 4 : 2,
                  transform: [{ scale: selectedPlanItem === currentPlan._id ? 1.02 : 1 }],
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: theme.fontSizes.small,
                        fontWeight: theme.fontWeights.bold as "700",
                        color: theme.colors.text,
                        marginBottom: 1,
                      }}
                    >
                      {planDetails.duration} {planDetails.durationType}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: selectedPlanItem === currentPlan._id ? theme.colors.secondPrimary : theme.colors.background,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: theme.colors.secondPrimary,
                    }}
                  >
                    {selectedPlanItem === currentPlan._id && (
                      <Ionicons name="checkmark" size={12} color={theme.colors.textWhite} />
                    )}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.secondPrimary,
                      marginRight: 4,
                    }}
                  >
                    ₹{planDetails.price}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                addingIntoToCart("dietplan");
              }}
              disabled={cartLoading}
              style={{
                backgroundColor: theme.colors.success,
                borderRadius: 30,
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Ionicons name="cart" size={22} color={theme.colors.textWhite} />
              <Text
                style={{
                  color: theme.colors.textWhite,
                  fontSize: theme.fontSizes.regular,
                  fontWeight: theme.fontWeights.bold as "700",
                  marginLeft: 8,
                }}
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default DietPlanInfo;
