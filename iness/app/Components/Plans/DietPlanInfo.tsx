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
      <View style={{ flex: 1, backgroundColor: "#F8F8F8", paddingHorizontal: 16 }}>
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
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#F5F5F5",
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
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="information-circle" size={18} color="#9747FF" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                }}
              >
                Overview
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                color: "#666",
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
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F5F5F5",
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
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#E8F5E9",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#67C694" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#000",
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
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#E8F5E9",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      marginTop: 1,
                    }}
                  >
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#67C694"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      flex: 1,
                      lineHeight: 22,
                      fontWeight: "500",
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
                backgroundColor: "#FFFFFF",
                padding: 20,
                borderRadius: 20,
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#E8F5E9",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={20}
                    color="#67C694"
                  />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  Download your diet plan
                </Text>
              </View>
              <Ionicons
                name="cloud-download-outline"
                size={22}
                color="#9747FF"
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
              backgroundColor: "#FFFFFF",
              paddingTop: 12,
              paddingLeft: Math.min(20, screenWidth * 0.05),
              paddingRight: Math.min(20, screenWidth * 0.05),
              paddingBottom: 12,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: "#F5F5F5",
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
                      ? "#F3EDFF"
                      : "#FFFFFF",
                  borderWidth: selectedPlanItem === currentPlan._id ? 2 : 1.5,
                  borderColor:
                    selectedPlanItem === currentPlan._id
                      ? "#9747FF"
                      : "#E0E0E0",
                  borderRadius: 14,
                  padding: 10,
                  paddingVertical: 12,
                  shadowColor: selectedPlanItem === currentPlan._id ? "#9747FF" : "#000",
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
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#000",
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
                      backgroundColor: selectedPlanItem === currentPlan._id ? "#9747FF" : "#E0E0E0",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: selectedPlanItem === currentPlan._id ? 0 : 2,
                      borderColor: "#9747FF",
                    }}
                  >
                    {selectedPlanItem === currentPlan._id && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
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
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#9747FF",
                      marginRight: 4,
                    }}
                  >
                    ₹{planDetails.price}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <ProtectedAnimatedSubmitButton
              loading={cartLoading}
              title="Add to cart"
              onPress={() => {
                addingIntoToCart("dietplan");
              }}
              height={50}
            />
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default DietPlanInfo;
