import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";

import { setCurrentPlan } from "@/Slices/planSlice";
import theme from "../Theme/globalTheme";
interface PlanCardProps {
  item: any;
  index: number;
  planGroupLength: number;
}
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PlanCard: React.FC<PlanCardProps> = ({
  item,
  index,
  planGroupLength,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <View
      key={index}
      style={{
        marginRight: index === planGroupLength - 1 ? 0 : 12,
        width: 280,
        height: 209,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={["#9C56F6", "#3A1B63"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Text
            style={{
              fontWeight: theme.fontWeights.bold,
              fontSize: theme.fontSizes.regular,
              color: theme.colors.text,
              marginBottom: 6,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>

          <View>
            {item.descItems?.slice(0, 3).map((desc: string, idx: number) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 5.5,
                    backgroundColor: "rgba(229, 210, 255, 1)",
                    marginRight: 6,
                    marginTop: 2,
                  }}
                />

                <Text
                  style={{ color: "#fff", fontSize: 12, flex: 1 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {desc}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: " rgba(189, 255, 132, 1)",
              width: SCREEN_WIDTH * 0.3, // ~30% of screen width
              height: SCREEN_WIDTH * 0.08, // scales proportionally
              borderRadius: (SCREEN_WIDTH * 0.5) / 2,
              justifyContent: "center",

              alignItems: "center",
              marginTop: 4,
            }}
            onPress={() => {
              router.push("/dashboard/plandetails");
              dispatch(setCurrentPlan(item));
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: theme.fontSizes.regularSmall,
                textAlign: "center",
                color: theme.colors.dark,
              }}
            >
              Check Details
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default PlanCard;
