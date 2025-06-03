import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { PlanInterface } from "../interfaces/planInterface";
import { ImageWithLoader } from "./ImageWithLoader";
import { router } from "expo-router";

export default function SliderCard() {
  const plans = useSelector((state: RootState) => state.plan.plans);

  return (
    <LinearGradient
      colors={["#9C56F6", "#3A1B63"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        height: 200,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
      }}
    >
      {/* Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              color: theme.colors.text,
            }}
          >
            <MaterialCommunityIcons
              name="run"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Explore our plans
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.regularSmall,
              fontWeight: theme.fontWeights.regular,
              color: theme.colors.text,
            }}
          >
            Tailored plans for your personalized lifestyles.
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.text}
        />
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {plans.map((item: PlanInterface, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D6B6FF",
              borderRadius: 12,
              marginRight: 12,
              width: 310,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: "90%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: "95%",
              }}
            >
              {/* Left Section */}
              <View
                style={{
                  flex: 1,

                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  height: "90%",
                }}
              >
                <Text
                  style={{
                    fontWeight: theme.fontWeights.bold,
                    fontSize: theme.fontSizes.regular,
                    marginBottom: 6,
                    color: theme.colors.dark,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#B4F455",
                    width: 114,
                    height: 31,
                    borderRadius: 16,
                    alignSelf: "flex-start",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => router.push("/dashboard/plan")}
                >
                  <Text
                    style={{
                      fontWeight: theme.fontWeights.bold,
                      fontSize: theme.fontSizes.regularSmall,
                      textAlign: "center",
                      color: theme.colors.dark,
                    }}
                  >
                    Know More
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right Section - Image */}
              <View
                style={{
                  height: "90%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ImageWithLoader uri={item.imgUrl} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
