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
        height: 220,
        paddingVertical: 18,
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
              marginTop: 4,
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 8 }}
      >
        {plans.map((item: PlanInterface, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D6B6FF",
              borderRadius: 12,
              marginRight: 12,
              width: 290,
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
                width: "95%",
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
                  width: "60%",
                }}
              >
                {/* Title */}
                <Text
                  style={{
                    fontWeight: theme.fontWeights.bold,
                    fontSize: 14,
                    marginBottom: 6,
                    color: theme.colors.dark,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>

                {/* Bullet List Section */}
                <View style={{ marginBottom: 8 }}>
                  {item.descItems
                    ?.slice(0, 2)
                    .map((desc: string, idx: number) => (
                      <View
                        key={idx}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start", // align top edges
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "#000",
                            marginRight: 4,
                            fontSize: 10,
                            lineHeight: 14,
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "500",
                            color: theme.colors.dark,
                            lineHeight: 14,
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail" // optional: adds "..." if it's too long
                        >
                          {desc}
                        </Text>
                      </View>
                    ))}
                </View>

                {/* Know More Button */}
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
                  height: "95%",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40%",
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
