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
      <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: bottomSectionHeight + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
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
            {planDetails?.desc}
          </Text>

          {/* Desc Items */}
          {planDetails?.descItems && (
            <View>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
              >
                What it provides.
              </Text>
              {planDetails.descItems.map((item: string, idx: number) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                  <Text style={{ marginLeft: 8, fontSize: 14 }}>{item}</Text>
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
                backgroundColor: theme.colors.cardLight,
                padding: 16,
                borderRadius: 16,
                marginTop: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={24}
                  color="#7C3AED"
                />
                <Text
                  style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#4B5563",
                  }}
                >
                  Download your diet plan
                </Text>
              </View>
              <Ionicons
                name="cloud-download-outline"
                size={24}
                color="#4B5563"
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
          <LinearGradient
            colors={["#140A21", "#522987"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                width: 310,
                gap: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlanItem(currentPlan._id);
                }}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor:
                    selectedPlanItem === currentPlan._id
                      ? "#E0E7FF"
                      : "#F3F4F6",
                  borderWidth: selectedPlanItem === currentPlan._id ? 2 : 0,
                  borderColor:
                    selectedPlanItem === currentPlan._id
                      ? "#8B5CF6"
                      : "transparent",
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
                  <Text style={{ fontSize: 14, fontWeight: "600" }}>
                    {planDetails.duration} {planDetails.durationType}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#9333EA",
                      borderRadius: 999,
                      padding: 2,
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
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
                  ₹ {planDetails.price}
                </Text>
              </TouchableOpacity>
            </View>

            <AnimatedSubmitButton
              loading={cartLoading}
              title="Add to cart"
              onPress={() => {
                addingIntoToCart("dietplan");
              }}
            />
          </LinearGradient>
        </Animated.View>
      )}
    </>
  );
};

export default DietPlanInfo;
