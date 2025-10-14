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
      <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: bottomSectionHeight + 20, // 20 for safe spacing
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Overview */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 12,
              color: "#000",
            }}
          >
            Overview
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#333",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            {currentPlan?.planType.desc}
          </Text>

          <View>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              What it provides.
            </Text>
            {currentPlan?.descItems.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 14,
                    flexShrink: 1,
                    flexWrap: "wrap",
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
            <>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginVertical: 16,
                  color: "#000",
                }}
              >
                Plan Gallery
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
              >
                {currentPlan.otherImages.map(
                  (imgUrl: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(imgUrl)}
                      style={{ marginRight: 12 }}
                    >
                      <Image
                        source={{ uri: imgUrl }}
                        style={{
                          width: 120,
                          height: 80,
                          borderRadius: 8,
                          backgroundColor: "#eee",
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

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
            </>
          )}
        </ScrollView>
      </View>

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
        <LinearGradient
          colors={["#140A21", "#522987"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 20,
            paddingLeft: 20,
            paddingRight: 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          {/* Pricing Cards */}
          <View
            style={{
              flexDirection: "row",
              justifyContent:
                currentPlan?.planItems.length === 1
                  ? "center"
                  : "space-between",
              gap: 10,
            }}
          >
            {currentPlan?.planItems.map((plan, idx) => {
              const isSelected = selectedPlanItem === plan._id;
              const isSingle = currentPlan.planItems.length === 1;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedPlanItem(plan._id)}
                  activeOpacity={0.8}
                  style={{
                    width: isSingle ? 150 : "100%",
                    flex: isSingle ? 0 : 1,
                    backgroundColor: isSelected ? "#E0E7FF" : "#F3F4F6",
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? "#8B5CF6" : "transparent",
                    borderRadius: 16,
                    padding: 12,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {plan.duration} {plan.durationType}
                      {plan.sessionCount != null && (
                        <Text style={{ fontSize: 8, color: "#6B7280" }}>
                          {" "}
                          ({plan.sessionCount} sessions)
                        </Text>
                      )}
                    </Text>
                    {isSelected && (
                      <View
                        style={{
                          backgroundColor: "#9333EA",
                          borderRadius: 999,
                          padding: 2,
                        }}
                      >
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      marginVertical: 4,
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    ₹ {plan.price}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.dark,
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {plan.isOnline ? "Online" : "Offline"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AnimatedSubmitButton
            loading={cartLoading}
            title="Add to cart"
            onPress={() => {
              addingIntoToCart("plan");
            }}
            height={50}
          />
        </LinearGradient>
      </Animated.View>
    </>
  );
};

export default PlansInfo;
