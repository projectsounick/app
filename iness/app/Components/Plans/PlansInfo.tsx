// components/PlanPricingSelector.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { PlanInterface } from "@/app/interfaces/planInterface";
import DietPlanInfoModal from "@/app/modules/DietPlanModal";
import { withAuthGuard } from "@/app/Hoc/WithAuthGuardButton";
const ProtectedAnimatedSubmitButton = withAuthGuard(AnimatedSubmitButton);
interface Props {
  screenWidth: number;

  cartLoading: boolean;
  currentPlan: PlanInterface;
  selectedPlanItem: string | null;
  setSelectedPlanItem: (id: string) => void;
  setBottomSectionHeight: (height: number) => void;
  addingIntoToCart: (type: string) => void;
  theme: any;
  bottomSectionHeight: any;
}

const PlansInfo: React.FC<Props> = ({
  screenWidth,

  cartLoading,
  currentPlan,
  selectedPlanItem,
  setSelectedPlanItem,
  setBottomSectionHeight,
  addingIntoToCart,
  theme,
  bottomSectionHeight,
}) => {
  if (!currentPlan) return null;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <>
      {/* Main Scrollable Section */}
      <View style={{ flex: 1, backgroundColor: "#F8F8F8", paddingHorizontal: 16 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: bottomSectionHeight + 20, // 20 for safe spacing
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
              {currentPlan?.planType.desc}
            </Text>
          </View>

          {/* What it provides Card */}
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
            {currentPlan?.descItems.map((item, idx) => (
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
          {currentPlan?.dietPlanDetails ? (
            <DietPlanInfoModal dietPlan={currentPlan.dietPlanDetails} />
          ) : null}
          {currentPlan?.otherImages?.length > 0 && (
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
                    backgroundColor: "#F3EDFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="images" size={18} color="#9747FF" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  Plan Gallery
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 4 }}
              >
                {currentPlan.otherImages.map(
                  (imgUrl: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(imgUrl)}
                      style={{
                        marginRight: 12,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: "#F8F8F8",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Image
                        source={{ uri: imgUrl }}
                        style={{
                          width: 140,
                          height: 100,
                          borderRadius: 12,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal to view full image */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              zIndex: 2,
            }}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: "90%",
                height: "70%",
                resizeMode: "contain",
                borderRadius: 12,
              }}
            />
          ) : null}
        </View>
      </Modal>

      {/* Fixed Bottom Section - Full Width Gradient */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: screenWidth,
          transform: [{ translateY }],
        }}
        onLayout={(event) => {
          setBottomSectionHeight(event.nativeEvent.layout.height);
        }}
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
          {/* Pricing Cards */}
          <View
            style={{
              flexDirection: currentPlan?.planItems.length === 1 ? "row" : "row",
              justifyContent:
                currentPlan?.planItems.length === 1
                  ? "center"
                  : "space-between",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {currentPlan?.planItems.map((plan, idx) => {
              const isSelected = selectedPlanItem === plan._id;
              const isSingle = currentPlan.planItems.length === 1;
              const cardWidth = isSingle 
                ? Math.min(180, screenWidth * 0.45)
                : (screenWidth - Math.min(40, screenWidth * 0.1) * 2 - 10) / 2;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedPlanItem(plan._id)}
                  activeOpacity={0.7}
                  style={{
                    width: isSingle ? cardWidth : undefined,
                    flex: isSingle ? 0 : 1,
                    backgroundColor: isSelected ? "#F3EDFF" : "#FFFFFF",
                    borderWidth: isSelected ? 2 : 1.5,
                    borderColor: isSelected ? "#9747FF" : "#E0E0E0",
                    borderRadius: 14,
                    padding: 10,
                    paddingVertical: 12,
                    shadowColor: isSelected ? "#9747FF" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.15 : 0.08,
                    shadowRadius: isSelected ? 6 : 4,
                    elevation: isSelected ? 4 : 2,
                    transform: [{ scale: isSelected ? 1.02 : 1 }],
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
                        {plan.duration} {plan.durationType}
                      </Text>
                      {plan.sessionCount != null && (
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#666",
                            fontWeight: "400",
                          }}
                        >
                          {plan.sessionCount} sessions
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: isSelected ? "#9747FF" : "#E0E0E0",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: isSelected ? 0 : 2,
                        borderColor: "#9747FF",
                      }}
                    >
                      {isSelected && (
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
                      ₹{plan.price}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isSelected ? "#FFFFFF" : "#F8F8F8",
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      borderRadius: 6,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Ionicons
                      name={plan.isOnline ? "videocam" : "location"}
                      size={11}
                      color={isSelected ? "#9747FF" : "#666"}
                      style={{ marginRight: 3 }}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        color: isSelected ? "#9747FF" : "#666",
                        fontWeight: "600",
                      }}
                    >
                      {plan.isOnline ? "Online" : "Offline"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <ProtectedAnimatedSubmitButton
            loading={cartLoading}
            title="Add to cart"
            onPress={() => {
              addingIntoToCart("plan");
            }}
            height={50}
          />
        </View>
      </Animated.View>
    </>
  );
};

export default PlansInfo;
